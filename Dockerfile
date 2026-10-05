# syntax=docker/dockerfile:1

# Production image for the portfolio frontend (Next.js standalone output).
#
# IMPORTANT — two things about how this app builds:
#   1. Pages prerender against the backend API while `next build` runs, so the
#      API must be reachable FROM the build, at NEXT_PUBLIC_API_URL.
#   2. NEXT_PUBLIC_* values are baked into the bundle at build time, so changing
#      one means rebuilding the image (they are build args, not runtime env).
# See DOCKER.md for the full walkthrough.

# Pin for reproducible builds:  --build-arg NODE_IMAGE=node:26-alpine@sha256:<digest>
ARG NODE_IMAGE=node:26-alpine

# ── 1. dependencies ──────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: no dependency gets to run code at install time (supply-chain
# hardening). Nothing the build needs relies on install scripts.
# The cache mount keeps npm's download cache between builds without baking it in.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund

# ── 2. build ─────────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public configuration, baked in at build time. All optional; empty values fall
# back to the defaults in lib/constants.ts (which is why this works without any).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_RESUME_URL
ARG NEXT_PUBLIC_AMBIENT_TRACK_1_URL
ARG NEXT_PUBLIC_AMBIENT_TRACK_2_URL
ARG NEXT_PUBLIC_AMBIENT_TRACK_3_URL
# "false" when a reverse proxy (the bundled Caddy) does the compression instead.
ARG NEXT_COMPRESS=true
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_PUBLIC_RESUME_URL=$NEXT_PUBLIC_RESUME_URL \
    NEXT_PUBLIC_AMBIENT_TRACK_1_URL=$NEXT_PUBLIC_AMBIENT_TRACK_1_URL \
    NEXT_PUBLIC_AMBIENT_TRACK_2_URL=$NEXT_PUBLIC_AMBIENT_TRACK_2_URL \
    NEXT_PUBLIC_AMBIENT_TRACK_3_URL=$NEXT_PUBLIC_AMBIENT_TRACK_3_URL \
    NEXT_COMPRESS=$NEXT_COMPRESS \
    DOCKER_BUILD=true \
    NEXT_TELEMETRY_DISABLED=1

# The cache mount keeps webpack's compile cache between builds (rebuilds after a
# small change are much faster). Next's fetch cache lives there too, so it is
# cleared first: every build must prerender from the API as it is *now*.
RUN --mount=type=cache,target=/app/.next/cache \
    rm -rf .next/cache/fetch-cache && npm run build

# ── 3. runtime ───────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

LABEL org.opencontainers.image.title="portfolio-frontend" \
      org.opencontainers.image.description="Next.js portfolio frontend (standalone build)" \
      org.opencontainers.image.licenses="UNLICENSED"

# Heap ceiling: measured under 40 concurrent connections, the server stays healthy
# down to a 48 MB heap, so 128 MB is ~2.5x headroom; a small young generation
# (semi-space) cut resident memory by ~35% with no loss in throughput. Keep the
# container's mem_limit at about twice the heap (compose uses 256m).
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NODE_OPTIONS="--max-old-space-size=128 --max-semi-space-size=4"

# Unprivileged user, and no package manager in the runtime image: the server needs
# only the node binary, and npm drags in dependencies that vulnerability scanners
# flag. (Removing files here doesn't shrink the image; it shrinks the attack surface.)
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs \
    && rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx \
              /usr/local/bin/corepack /opt/yarn* /usr/local/bin/yarn* \
    && mkdir -p .next/cache .next/server/route-cache \
    && chown -R nextjs:nodejs .next

# Next writes regenerated (ISR) pages to .next/cache and .next/server/route-cache and
# nowhere else, so these are the only paths that need to be writable. Everything
# else can be mounted read-only (see docker-compose.yml).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER 1001:1001
EXPOSE 3000

# robots.txt is static and tiny, so checking it costs almost nothing.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["wget", "-qO", "/dev/null", "http://127.0.0.1:3000/robots.txt"]

CMD ["node", "server.js"]
