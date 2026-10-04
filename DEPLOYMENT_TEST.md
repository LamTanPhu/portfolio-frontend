# Deployment Test Plan — Frontend Docker image (backup to Vercel)

Goal: prove the image behaves like your Vercel deployment **before** you rely on it as a fallback.
Run top to bottom. Every step has an expected result; anything else is a bug to fix now, not during an outage.

Prereq: `DOCKER_GUIDE.md` §3 done (image built with your **real** `NEXT_PUBLIC_*` values, stack up, backend reachable).
Assumed names (Compose): container `portfolio-frontend-web-1`, image `portfolio-web:local`.

---

## Phase 1 — Does it boot correctly?

| # | Command | Expected |
|---|---|---|
| 1 | `docker compose ps` | `web` healthy (allow ~20 s) |
| 2 | `curl -I http://127.0.0.1:3000/` | `200` |
| 3 | `curl -s http://127.0.0.1:3000/robots.txt` | `Sitemap:` line uses **your** `NEXT_PUBLIC_SITE_URL` |
| 4 | `curl -s http://127.0.0.1:3000/sitemap.xml \| head` | Real project/blog slugs from your API, not fixtures |
| 5 | `curl -I http://127.0.0.1:3000/nope` | `404` |
| 6 | `docker compose exec web id` | `uid=1000(node)`, not root |
| 7 | `docker compose exec web sh -c "touch /app/x"` | fails: Permission denied (`/app` is root-owned) |
| 8 | `docker compose exec web sh -c "touch /app/.next/x && rm /app/.next/x && echo ok"` | `ok` (ISR needs this) |
| 9 | From another machine on your network: `curl http://<your-lan-ip>:3000/` | connection refused (loopback bind) |
| 10 | `docker inspect --format '{{ index .Config.Labels "portfolio.mock-api-build" }}' portfolio-web:local` | `false`. If `true`, this image has fixture data: rebuild. |
| 11 | `docker compose logs web` | `Ready in …`, no `fetch failed` / `ECONNREFUSED` |

## Phase 2 — Functional smoke tests (in a browser, against the container)

Open `http://localhost:3000` (or the real domain if you pointed one at it).

- [ ] Home, About, Projects, Blog render **real data** from your API, not Acme Corp / fixtures.
- [ ] A project detail page and a blog post open (`/projects/<slug>`, `/blog/<slug>`).
- [ ] View source on a detail page: `<link rel="canonical">` and `og:url` use your real site URL, not `localhost`.
- [ ] DevTools → Network: API calls go to your real API URL, not `localhost:3001` (proves the build arg took).
- [ ] No red CORS errors in the console. If there are, backend `FRONTEND_URL` is missing this origin.
- [ ] Resume download works (`/resume.pdf`) and the click is tracked.
- [ ] Ambient audio control plays the tracks.
- [ ] Contact page: Turnstile widget loads. With the test site key it always passes; with your real key it must match the domain you're on.
- [ ] **Admin login**, navigate between admin pages, **hard refresh while logged in** → still logged in. This is the `SameSite=Strict` check: fails if frontend and API are different sites.
- [ ] Logout → admin pages redirect to login.
- [ ] **ISR / server-to-API path:** change something visible in the backend (rename a project or publish a blog post), wait ~70 s, reload twice. The change appears **without rebuilding**. If it never does, the *container* can't reach the API (`localhost` problem, `DOCKER_GUIDE.md` §5) even though your browser can.
- [ ] Lighthouse in Chrome DevTools on `/`: no surprises compared with the Vercel deployment.

## Phase 3 — Persistence & resilience

There's no database, so this phase is about restarts and a dead backend.

| Test | Steps | Expected |
|---|---|---|
| Container restart | `docker compose restart web` | Back to `200` within ~10 s, healthy within ~20 s |
| Container deletion | `docker compose down && docker compose up -d` | Site is back, no rebuild needed (image persists) |
| Graceful shutdown | `docker compose stop web`, then `docker inspect -f '{{.State.ExitCode}}' portfolio-frontend-web-1` | `143` (SIGTERM, immediate) is fine here. `137` means Docker had to SIGKILL after the 10 s timeout, which means signals aren't reaching Node: check `init: true` / `--init`. |
| **Backend down** | Stop or break the API, reload `/`, `/projects`, a blog post | Prerendered pages keep serving (possibly stale). Admin login and contact fail. No crash, container stays healthy. |
| Backend back | Start the API again, wait ~70 s | Pages refresh without restarting `web` |
| **PC reboot** | Reboot, start Docker Desktop | `restart: unless-stopped` brings `web` back on its own |

**Reminder:** with this stack the site runs *on your PC*. It validates the image. It is not a backup until the same image runs on someone else's always-on machine (Phase 5).

## Phase 4 — Security checks

```bash
# No secrets in the image (the frontend should have none to begin with)
docker run --rm --entrypoint sh portfolio-web:local -c 'env | grep -iE "secret|password|token|key" || echo "clean"'
#   -> clean

# Build args are visible in history. Confirm the ONLY values there are public NEXT_PUBLIC_* ones.
docker history --no-trunc portfolio-web:local | grep -i "NEXT_PUBLIC"
#   -> expected: your public URLs/site key. Anything that looks like a secret = stop, rotate it.

# No dev tooling shipped
docker run --rm --entrypoint sh portfolio-web:local -c 'ls node_modules/.bin | grep -E "^(tsc|eslint|vitest|tailwindcss)$" || echo "clean"'

# No source maps (productionBrowserSourceMaps is false)
docker run --rm --entrypoint sh portfolio-web:local -c 'find .next/static -name "*.map" | wc -l'
#   -> 0

# No build cache or env files shipped
docker run --rm --entrypoint sh portfolio-web:local -c 'test ! -e .next/cache && echo "no build cache"; ls -A | grep -E "^\.env" || echo "no env files"'

# Vulnerability scan
docker scout quickview portfolio-web:local     # or: trivy image portfolio-web:local
```
Fix or consciously accept anything HIGH/CRITICAL that has a fix available. Your CI runs OSV/CodeQL on the repo; this scans the **OS packages and the final image**, which they don't.

(`.next/cache` may reappear after the container has served traffic: Next recreates it at runtime. The check is about the *image*, so run it on a fresh `docker run`, which is what the command above does.)

## Phase 5 — Running it off your machine (this is what makes it a backup)

Same image, different host. The image is tied to its build args, so build it with the **real production** `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`.

- **Any Docker host (VPS, Oracle Always Free VM):** copy `compose.yaml` + `.env.docker`, `docker compose --env-file .env.docker up -d --build`. Put **Caddy** (or another TLS reverse proxy) in front and bind the container to loopback. You own patching, firewall (open 80/443 only) and updates. Oracle ARM VM → build on the VM, or `docker buildx build --platform linux/arm64`.
- **A PaaS that builds from a Dockerfile (Render, etc.):** point it at this repo's `Dockerfile` and supply the `NEXT_PUBLIC_*` values as **build arguments** (check how your provider passes env vars to Docker builds; this is the part that differs). The container listens on `$PORT` (default 3000).
- **Failover:** the usual plan is DNS: keep the real domain on Vercel, and when Vercel is down repoint the record (or a CNAME) at the backup host. For that to work cleanly:
  - the backup must be built with the **real** site URL, so canonicals and sitemap are right;
  - the backup's origin must be in backend `FRONTEND_URL`;
  - the backup must be on the **same site** as the API (cookie is `SameSite=Strict`), e.g. a subdomain of your domain. On a random `*.onrender.com`-style hostname the public pages work and admin login doesn't;
  - keep DNS TTL low, or the switch takes hours.
- **Rebuild cadence:** the backup only has the code and base image from its last build. Rebuild it after meaningful releases and monthly for security patches.

## Pass criteria

Phase 1–4 all green with an image built from your real values, and one successful run of the same image on a machine that isn't your PC. Only then call it a backup.
