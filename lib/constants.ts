export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// Public site origin — used for canonical URLs, Open Graph tags, and
// sitemap.xml. No trailing slash. Falls back to localhost for dev; set
// NEXT_PUBLIC_SITE_URL in production (e.g. https://lamtanphu.dev).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Cloudflare Turnstile site key (public — pairs with TURNSTILE_SECRET_KEY on
// the backend, which does the actual verification). Falls back to Cloudflare's
// official "always passes" test key so local dev works without setup —
// swap in the real site key via env for anything beyond localhost.
export const TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'