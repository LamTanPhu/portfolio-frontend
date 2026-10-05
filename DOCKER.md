# Hosting the frontend with Docker (backup to Vercel)

Vercel stays your primary host. This is the same site as a hardened, small container you can run anywhere — a VPS, Fly.io, Railway, Render, Cloud Run, a Raspberry Pi. **Nothing here changes your Vercel build**: every Docker-specific setting switches on only when `DOCKER_BUILD=true`, which only the Dockerfile sets.

## Quick start

```
copy .env.docker.example .env.docker
```

Edit `.env.docker` (at minimum `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`), then:

```
docker compose --env-file .env.docker up -d --build
```

The site is on http://localhost:3000 (bound to this machine only; see `WEB_BIND`). Logs: `docker compose logs -f web`. Stop: `docker compose down`.

**On a server with a domain** — adds automatic HTTPS, HTTP/2 + HTTP/3 and zstd/gzip compression through Caddy. In `.env.docker` set `NEXT_COMPRESS=false` and `SITE_ADDRESS=your.domain`, then:

```
docker compose --env-file .env.docker --profile proxy up -d --build
```

Without compose:

```
docker build -t portfolio-frontend --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api .
docker run -d -p 3000:3000 --restart unless-stopped portfolio-frontend
```

## Two things that are different from Vercel

**1. The API must be reachable while the image builds.** Your pages prerender against the backend during `next build`, so `docker build` fails if `NEXT_PUBLIC_API_URL` can't be reached from inside the build. A public URL always works. For a backend on your own PC use `http://host.docker.internal:3001/api` for the build — but see point 2.

**2. `NEXT_PUBLIC_*` values are baked in at build time.** They are build args, not runtime settings: change one and you rebuild the image. The API URL is also what your *visitors' browsers* call, so for anything beyond a local test it must be a real public address.

## What was optimised, and what it measured

Numbers are from my test machine (shared CPU, no Docker available, so the same build and server run directly), compared against the first version of this Dockerfile. Treat them as relative, not absolute.

| Area | What | Measured |
|---|---|---|
| Size | No sharp/native image libs (every `<Image>` is already `unoptimized`), so the optimizer is off and its binaries are left out | standalone server **96 MB → 59 MB** |
| Memory | Heap capped at 128 MB, small young generation | after load **255 MB → ~160 MB**, same throughput; the server survives down to a 48 MB heap, so 128 MB is ~2.5x headroom |
| Throughput | Compression done by Caddy instead of Node (`NEXT_COMPRESS=false`) | Node serving uncompressed: **~485 → ~850 req/s**; via Caddy with zstd (shared CPU here): ~560 req/s, page 52 KB → 8.7 KB |
| Latency | — | p99 ≈ 80–130 ms at 30–40 concurrent connections |
| Caching | `public/` files (audio, svg, images) get `max-age=1 day` + `stale-while-revalidate=1 week`; resume PDF 1 hour; hashed `/_next/static` is already immutable | was revalidated on every visit |
| Build | npm cache + webpack cache kept between builds (BuildKit cache mounts), dependencies install with `--ignore-scripts` | rebuilds after a small change skip dependency download and most compilation |

## Security

- **Runs as an unprivileged user (uid 1001)** on a **read-only filesystem**, with **all Linux capabilities dropped** and `no-new-privileges`. Only three in-memory (tmpfs) paths are writable: `/tmp` and the two directories where Next stores regenerated pages — tested across an ISR regeneration with zero errors.
- **No package manager in the runtime image** (npm is removed), and dependencies install **without running install scripts**.
- **Response headers**: `Content-Security-Policy` (scripts only from this site and Cloudflare Turnstile; API origin read from `NEXT_PUBLIC_API_URL`), `X-Frame-Options: DENY` (+ `frame-ancestors 'none'`), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener/Resource-Policy`; `Strict-Transport-Security` and `upgrade-insecure-requests` when `NEXT_PUBLIC_SITE_URL` is `https://`. No `X-Powered-By`, and Caddy removes its `Server` header.
- **Limits** so one bad day can't take down the host: 256 MB memory (no swap), 1 CPU, 128 processes, capped log files.
- Published on `127.0.0.1` by default; the proxy (or `WEB_BIND=0.0.0.0`) exposes it.
- No secrets are involved: everything `NEXT_PUBLIC_*` is public by design.
- `'unsafe-inline'` remains in `script-src`: the pages are static, so Next's inline bootstrap script can't carry a per-request nonce. Scripts from any other site are still blocked.
- Pin the base image for reproducible builds: `--build-arg NODE_IMAGE=node:26-alpine@sha256:<digest>` (Dependabot keeps `node` and `caddy` current).

## Checklist before you rely on it

- **Backend CORS:** add the backup site's origin to `FRONTEND_URL` on the backend (comma-separated), e.g. `FRONTEND_URL=https://yourdomain.com,https://backup.yourdomain.com`.
- **Admin login needs the same site as the API.** The backend sets the refresh cookie with `SameSite=Strict`, so the browser only keeps it when the frontend and API share a registrable domain (e.g. `backup.yourdomain.com` and `api.yourdomain.com`). On an unrelated domain the public pages work but admin login will not. Test `/admin/login` on the backup once.
- **Turnstile:** set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to your real key (empty = Cloudflare's always-passes test key = no bot protection), and add the backup hostname to the widget's allowed domains.
- **Open the site once with DevTools → Console** and look for "Content Security Policy" messages. The policy was checked against nine pages, audio, blog search and admin login in a real browser with no violations, but Cloudflare Turnstile (behind the snake game) and your real Google Fonts build could not be exercised here.

## Updating

Pull the new code and run the same `docker compose ... up -d --build`. Pages refresh from the API about once a minute on their own (the same 60-second revalidation as on Vercel); rebuild only for code or `NEXT_PUBLIC_*` changes. Other CPU architectures (e.g. a Raspberry Pi): `docker buildx build --platform linux/arm64 ...`.

## What CI checks

The `docker` job in `ci.yml` builds the image and boots it **with the same read-only/no-capabilities restrictions as compose**, then asserts: pages render, 404 works, the security headers are present, no `X-Powered-By`, the process runs as uid 1001 and the container reports healthy. It also runs a vulnerability scan that is report-only until you remove its `continue-on-error`.
