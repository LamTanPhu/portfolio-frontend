# Docker Guide — Portfolio Frontend

Goal: a container image of the Next.js site that you can run anywhere as a **backup** to Vercel.
Vercel stays your primary host. Nothing here affects it: Vercel ignores the `Dockerfile` and builds with `npm run build` like always.

Two paths: **A) Compose (what you'll actually use)** and **B) Plain `docker` commands (to see what Compose does for you)**.

> Files this guide uses (repo root): `Dockerfile`, `.dockerignore`, `compose.yaml`, `.env.docker.example`.
> Also changed: `.gitignore` gained `!.env.docker.example`. Your old `.env*` rule was ignoring the template too.

---

## 0. Read this first: the one thing that's different from the backend

The backend image is configured at **runtime** (env vars). The frontend image is configured at **build time**.

| Value | When it's fixed | Change it → |
|---|---|---|
| `NEXT_PUBLIC_API_URL`, `_SITE_URL`, `_TURNSTILE_SITE_KEY`, `_RESUME_URL`, `_AMBIENT_TRACK_n_URL` | `docker build` (inlined into the JS bundle) | **rebuild the image** |
| `PORT`, host port mapping | `docker run` | restart container |

Consequences:
- An image is tied to **one API URL and one site URL**. Backup image for `you.dev` → build it with the real production values.
- `NEXT_PUBLIC_*` ships to every visitor. **No secrets in there, ever.** The frontend has no secrets, so that's fine.
- **The build calls your API.** Pages (`/`, `/projects/[slug]`, `/blog/[slug]`, sitemap…) are prerendered against it. API unreachable during build → build fails (on purpose, loudly).
- **The build downloads a Google Font** (`next/font/google`, JetBrains Mono). No internet during build → build fails.
- `NEXT_PUBLIC_API_URL` is one value used in **three places**: the build, the running container (ISR refresh every 60 s + server rendering), and the visitor's browser. It must work from all three. See §5.

---

## 1. Install & sanity check

Docker Desktop (Windows/macOS, WSL2 backend on Windows) or Docker Engine + Compose plugin (Linux).

```bash
docker --version
docker compose version     # must be v2 (space, not hyphen)
docker run --rm hello-world
```

Mental model (image, container, volume, network, compose) is the same as in the backend's `DOCKER_GUIDE.md` §1. Difference: this stack has **no database, no volume, no network of its own**. One container.

---

## 2. What the Dockerfile does

```
base ──► deps ──► build ──► (.next, public)
  │                              │
  └──► prod-deps ────────────────┴──► runtime   (TARGET, default)
```

| Stage | Purpose |
|---|---|
| `base` | `node:26-bookworm-slim` + CA certs. Node 26 matches your CI; override with `--build-arg NODE_VERSION=24`. |
| `deps` | `npm ci` with dev deps. Cached until `package*.json` changes. |
| `build` | Takes the `NEXT_PUBLIC_*` build args, refuses to continue if `NEXT_PUBLIC_API_URL` is empty (unless mock), runs `npm run build` (= `next build --webpack` + your obfuscator), asserts `.next/BUILD_ID` exists, deletes `.next/cache` (~250 MB of build cache). |
| `prod-deps` | `npm ci --omit=dev`: no TypeScript, tailwind, vitest, eslint in the final image. |
| `runtime` | prod `node_modules` + `.next` + `public` + `next.config.ts`. Runs as user `node`, `HEALTHCHECK` on `/robots.txt`, starts with `next start`. |

No `migrate` stage. There's no database here.

Decisions you might question:

- **Not `output: "standalone"`.** That needs a change in `next.config.ts` and I didn't touch your app code. The cost is image size: expect roughly **0.8–0.9 GB** (estimate, check `docker images`; `node_modules` is ~600 MB, mostly Next's own binaries and `react-icons`). Fine for a backup. If you want it ~3× smaller later, add `output: 'standalone'` and I'll adapt the runtime stage. Vercel doesn't care either way.
- **No `read_only: true` (the backend has it).** ISR rewrites prerendered pages under `.next/` every 60 s. That directory has to be writable. `/app` itself is still root-owned, so `node` can only write inside `.next`.
- **Healthcheck hits `/robots.txt`.** It's static, so it proves "the server is up", not "the API is reachable". The frontend has no health endpoint.
- **`BUILD_WITH_MOCK_API=true`** builds against your `e2e/mock-api` fixtures (same trick as CI). Smoke-test only: the pages are prerendered with fake data and the image is labelled `portfolio.mock-api-build=true` so you can tell. **Never deploy it.**

---

## 3. Path A — Compose (recommended)

### 3.1 Create the env file
```bash
cp .env.docker.example .env.docker
```
Edit `.env.docker`:
1. `NEXT_PUBLIC_API_URL` = your backend, **including `/api`**, no trailing slash. Example: `https://api.you.dev/api`.
2. `NEXT_PUBLIC_SITE_URL` = the origin this site is served from. Wrong value → wrong canonical/OG/sitemap URLs.
3. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = your real Turnstile **site** key. Empty = Cloudflare's always-pass test key.
4. Verify it's ignored: `git check-ignore -v .env.docker` prints a rule; `git status` doesn't list it.

If the backend is on Render's free tier, **wake it first** (`curl https://api.you.dev/api/health`) or the build may hit a sleeping API and fail.

### 3.2 Build and start
```bash
docker compose --env-file .env.docker up -d --build
```
`--env-file` is not optional here. `NEXT_PUBLIC_*` are build args, and Compose only reads them for interpolation from `--env-file` (or a file literally named `.env`).

### 3.3 Verify
```bash
docker compose ps                         # web: healthy (after ~20 s)
docker compose logs -f web                # "Ready in ..." and no fetch errors
curl -I http://127.0.0.1:3000/            # 200
curl -s http://127.0.0.1:3000/robots.txt  # sitemap line shows YOUR site URL
```
Open `http://localhost:3000` in a browser and click around.

### 3.4 Daily commands
```bash
docker compose --env-file .env.docker up -d --build   # rebuild after code OR env changes
docker compose up -d                                  # start existing image, no rebuild
docker compose logs -f web
docker compose restart web
docker compose stop                                   # stop, keep image
docker compose down                                   # remove container + network
docker compose exec web sh                            # shell (non-root)
```
`docker compose down` is safe: nothing is stored, the site is rebuilt from the image.

---

## 4. Path B — plain `docker` commands

```bash
# 1) Build (every --build-arg is public data)
docker build -t portfolio-web:local \
  --build-arg NEXT_PUBLIC_API_URL=https://api.you.dev/api \
  --build-arg NEXT_PUBLIC_SITE_URL=https://you.dev \
  --build-arg NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA_your_site_key \
  .

# 2) Run
docker run -d --name portfolio-web \
  -p 127.0.0.1:3000:3000 \
  --init --restart unless-stopped \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --memory 768m \
  portfolio-web:local

# 3) Check
docker ps
docker logs -f portfolio-web
curl -I http://127.0.0.1:3000/
```

No backend available? Smoke-test the image itself:
```bash
docker build -t portfolio-web:mock --build-arg BUILD_WITH_MOCK_API=true .
docker run --rm -p 127.0.0.1:3000:3000 --init portfolio-web:mock
```

Tear down: `docker rm -f portfolio-web`.

PowerShell: replace the trailing `\` with a backtick `` ` ``.

---

## 5. The API URL problem (read this before you blame the image)

`localhost` inside a container means **that container**. The same URL is used by the build, the server and the browser, so:

| Scenario | `NEXT_PUBLIC_API_URL` | Works? |
|---|---|---|
| **Backend on a public host** (Render, VPS…) | `https://api.you.dev/api` | **Yes, everywhere.** This is the backup scenario. |
| **Backend in its own Docker compose on your PC**, Linux | `http://localhost:3001/api` + `build.network: host` and `network_mode: host` (both are commented in `compose.yaml`) | Yes |
| Same, **Windows/macOS** | `http://localhost:3001/api` | **No.** Build can't reach it, container can't reach it. Run the frontend with `npm run dev` for local work. Use this image against a public API, or the mock. |
| **No backend** | leave empty + `BUILD_WITH_MOCK_API=true` | Smoke test only |

Two more things have to line up with the **backend** `.env`:

- **CORS:** backend `FRONTEND_URL` must contain this site's exact origin (scheme + host + port, no trailing slash). It accepts a comma-separated list, so put Vercel **and** the backup domain in it.
- **Cookies:** the refresh cookie is `SameSite=Strict`. Frontend and API must be the same *site*: `www.you.dev` + `api.you.dev` is fine, `you.dev` + `xyz.onrender.com` is not. A backup frontend on a random hostname will render public pages fine, but **admin login will appear to work and then fail on refresh**. Put the backup on a subdomain of your domain.

What happens when the API goes down while the container is running: prerendered pages keep being served (stale) and refresh once the API is back. Pages that need live data show errors. Admin and contact need the API.

---

## 6. When do I have to rebuild?

| Change | Rebuild? |
|---|---|
| Any code under `app/`, `src/`, `lib/` | Yes |
| Any `NEXT_PUBLIC_*` value | Yes |
| New project/blog post in the backend | **No**. Pages refresh within ~60 s via ISR. New slugs resolve on demand. |
| Swap `public/resume.pdf` or mp3 files | Yes (they're copied into the image) |
| Host port | No, just recreate the container |
| Node security patches / base image | Yes: `docker compose --env-file .env.docker build --pull --no-cache` |

---

## 7. Hardening already applied

| Setting | Effect |
|---|---|
| Multi-stage build, `--omit=dev` | No compiler/test tooling in the shipped image |
| `USER node` | App is not root in the container; `/app` is root-owned, only `.next` is writable |
| `cap_drop: ALL`, `no-new-privileges` | No Linux capabilities, no privilege escalation |
| `mem_limit: 768m`, `pids_limit: 200` | Runaway process can't take down the host. Measured idle/light-load RSS in my test run was ~140 MB, so the limit is generous. |
| Port bound to `127.0.0.1` | Not reachable from your LAN unless you set `WEB_BIND=0.0.0.0` |
| `.dockerignore` excludes `.env*`, `.git`, `.next`, `node_modules` | Secrets and local junk never enter image layers |
| `.next/cache` deleted after build | No 250 MB build cache and no build-time fetch cache in the image |
| Source maps off, obfuscation on | Already in your `next.config.ts`; the image inherits it |
| `HEALTHCHECK` | Compose/orchestrators can detect a dead server |

Still your job:
- Never pass a secret through `--build-arg`. Build args are visible in `docker history`.
- Rebuild periodically for base-image patches (§6).
- Scan the image: `docker scout quickview portfolio-web:local` or `trivy image portfolio-web:local`.

---

## 8. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Build stops with `ERROR: NEXT_PUBLIC_API_URL is empty` | You forgot `--env-file .env.docker` on `docker compose`, or the var is empty in it. |
| Build fails: `ECONNREFUSED` / `fetch failed` / `GET /… failed: 5xx` during "Generating static pages" | API unreachable or erroring from inside the build container. `localhost` won't work (§5). If Render free tier: it was asleep, wake it and rebuild. Test from your PC first: `curl <API_URL>/health`. |
| Build fails: `Failed to fetch font JetBrains Mono` | Build has no internet or Google Fonts is blocked (corporate/VPN/firewall). Fix the network and rebuild. |
| Build killed, exit code `137` / "Killed" | Out of memory. The webpack + obfuscator build is heavy. Raise Docker Desktop's memory (Settings → Resources) to 6–8 GB. |
| Site loads but browser calls `localhost:3001` / wrong host | The image was built with the wrong `NEXT_PUBLIC_API_URL`. It's baked in. Fix `.env.docker`, **rebuild**. |
| Canonical/OG/sitemap point to `localhost` | Same, for `NEXT_PUBLIC_SITE_URL`. |
| Browser: CORS error | Backend `FRONTEND_URL` doesn't contain this exact origin. |
| Admin login works, then logs you out on refresh | Cookie is `SameSite=Strict` and the frontend/API are different sites (§5). Safari also rejects `Secure` cookies on `http://localhost`. |
| Pages show fixture data (Acme Corp, "React Hooks Deep Dive"…) | Image was built with `BUILD_WITH_MOCK_API=true`. Check: `docker inspect --format '{{ index .Config.Labels "portfolio.mock-api-build" }}' portfolio-web:local`. Rebuild for real. |
| Content stays stale after updating the backend | Container can't reach the API for ISR refresh (`localhost` problem, §5). Check `docker compose logs web` for fetch errors. |
| Port 3000 already in use | Stop `npm run dev`, or set `WEB_PORT=3001` in `.env.docker`. |
| `docker compose ps` stuck on `starting` | Healthcheck has a 20 s grace period. After that, `docker compose logs web`. |
| Disk filling up | `docker system df`, then `docker image prune -f` / `docker builder prune`. |

---

## 9. Cheat sheet

```bash
docker ps -a                      # all containers
docker images                     # all images (check the size)
docker logs --tail 100 -f <name>  # logs
docker exec -it <name> sh         # shell
docker inspect <name>             # full config (incl. health)
docker stats                      # live CPU/RAM
docker compose --env-file .env.docker config   # print the fully-resolved compose file (shows your build args)
docker system prune               # remove stopped containers, dangling images, unused networks
```
