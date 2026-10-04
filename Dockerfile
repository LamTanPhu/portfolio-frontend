# syntax=docker/dockerfile:1.7
# =============================================================================
# Portfolio Frontend — multi-stage Dockerfile (Next.js 16, webpack build)
#
# Stages:
#   base       shared OS layer (node + CA certs)
#   deps       ALL dependencies (dev included) — cached unless package*.json changes
#   build      `next build --webpack` (optionally against the mock API)
#   prod-deps  production-only node_modules (what the runtime image ships)
#   runtime    TARGET (default, last stage): minimal, non-root image that serves the site
#
# IMPORTANT — what is baked in at BUILD time (not runtime):
#   * NEXT_PUBLIC_* values are inlined into the browser bundle by `next build`.
#     Changing any of them means REBUILDING the image. They are public by
#     definition (they ship to every visitor) — never put a secret in them.
#   * Pages are prerendered by calling the API during the build, so the API
#     must be reachable from inside the build container (or use the mock, below).
#   * `next/font/google` downloads JetBrains Mono during the build, so the
#     build also needs outbound internet to fonts.googleapis.com / gstatic.com.
#
# Build examples:
#   docker build -t portfolio-web:local \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.dev/api \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://example.dev .
#
#   # Smoke-test build with NO backend (same as CI). Prerenders fixtures — never deploy it.
#   docker build -t portfolio-web:mock --build-arg BUILD_WITH_MOCK_API=true .
# =============================================================================

# Matches CI (Node 26). Override: docker build --build-arg NODE_VERSION=24 .
ARG NODE_VERSION=26

# ---------------------------------------------------------------------------
# base
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
# ca-certificates: outbound TLS for the build (API prerender, Google Fonts) and
# for runtime ISR revalidation against the API.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# deps — full install (dev deps needed for the build: tailwind, typescript, ...)
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
# build — compile + prerender
# ---------------------------------------------------------------------------
FROM deps AS build

# Public, build-time configuration. All optional except NEXT_PUBLIC_API_URL
# (unless BUILD_WITH_MOCK_API=true). Empty string = "use the app's default".
ARG NEXT_PUBLIC_API_URL=
ARG NEXT_PUBLIC_SITE_URL=
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ARG NEXT_PUBLIC_RESUME_URL=
ARG NEXT_PUBLIC_AMBIENT_TRACK_1_URL=
ARG NEXT_PUBLIC_AMBIENT_TRACK_2_URL=
ARG NEXT_PUBLIC_AMBIENT_TRACK_3_URL=
ARG BUILD_WITH_MOCK_API=false

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY} \
    NEXT_PUBLIC_RESUME_URL=${NEXT_PUBLIC_RESUME_URL} \
    NEXT_PUBLIC_AMBIENT_TRACK_1_URL=${NEXT_PUBLIC_AMBIENT_TRACK_1_URL} \
    NEXT_PUBLIC_AMBIENT_TRACK_2_URL=${NEXT_PUBLIC_AMBIENT_TRACK_2_URL} \
    NEXT_PUBLIC_AMBIENT_TRACK_3_URL=${NEXT_PUBLIC_AMBIENT_TRACK_3_URL} \
    NEXT_TELEMETRY_DISABLED=1

COPY . .

# Fail fast with a readable message instead of an opaque ECONNREFUSED during prerender.
RUN if [ "${BUILD_WITH_MOCK_API}" != "true" ] && [ -z "${NEXT_PUBLIC_API_URL}" ]; then \
      echo "ERROR: NEXT_PUBLIC_API_URL is empty."; \
      echo "  Pass --build-arg NEXT_PUBLIC_API_URL=https://<your-api>/api   (must end in /api)"; \
      echo "  or --build-arg BUILD_WITH_MOCK_API=true for a throwaway smoke-test image."; \
      exit 1; \
    fi

# Real build:  `npm run build` (= next build --webpack, with the JS obfuscator plugin).
# Mock build:  same command, wrapped so the fixture API (e2e/mock-api) listens on
#              localhost:3001 while pages prerender — exactly what CI does.
#              NEXT_PUBLIC_API_URL is unset on purpose so the app's default
#              (http://localhost:3001/api) points at the mock.
RUN if [ "${BUILD_WITH_MOCK_API}" = "true" ]; then \
      echo ">>> MOCK API BUILD: pages are prerendered from fixtures. Do NOT deploy this image."; \
      env -u NEXT_PUBLIC_API_URL node e2e/with-mock-api.mjs npm run build; \
    else \
      npm run build; \
    fi

# Fail the build loudly if the output isn't where the runtime stage expects it,
# then drop the build cache (~250 MB) — it must not ship in the final image.
RUN test -f .next/BUILD_ID || (echo "ERROR: .next/BUILD_ID missing — build did not complete" && ls -la .next && exit 1) \
    && rm -rf .next/cache

# ---------------------------------------------------------------------------
# prod-deps — runtime node_modules only
# ---------------------------------------------------------------------------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund

# ---------------------------------------------------------------------------
# runtime — the image that actually runs (LAST stage = default build target)
# ---------------------------------------------------------------------------
FROM base AS runtime
ARG BUILD_WITH_MOCK_API=false
# Inspect later with: docker inspect --format '{{ index .Config.Labels "portfolio.mock-api-build" }}' <image>
LABEL portfolio.mock-api-build="${BUILD_WITH_MOCK_API}"

ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

# Code, deps and assets stay root-owned (read-only to the app).
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/public ./public
# next.config.ts + package.json are read by `next start` at boot.
COPY --from=build /app/next.config.ts /app/package.json ./
# ONLY .next is owned by `node`: ISR rewrites prerendered pages (revalidate: 60)
# and Next recreates .next/cache at runtime.
COPY --from=build --chown=node:node /app/.next ./.next

USER node
EXPOSE 3000

# Node image has no curl/wget — use node itself. /robots.txt is static, so this
# checks "the server is up", not "the API is reachable".
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# exec form → run with compose `init: true` (or `docker run --init`) so SIGTERM
# is forwarded and `docker stop` exits cleanly. Port comes from $PORT.
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0"]
