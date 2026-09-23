export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// Resume PDF served for the "download resume" link on the About page and
// tracked via POST /analytics/resume-download. No file ships in this repo —
// drop the actual PDF at public/resume.pdf, or set NEXT_PUBLIC_RESUME_URL to
// point at one hosted elsewhere (e.g. a CDN URL), before this link works.
export const RESUME_URL = process.env.NEXT_PUBLIC_RESUME_URL ?? '/resume.pdf'

// Public site origin — used for canonical URLs, Open Graph tags, and
// sitemap.xml. No trailing slash. Falls back to localhost for dev; set
// NEXT_PUBLIC_SITE_URL in production (e.g. https://lamtanphu.dev).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Looped ambient background track (see AmbientAudioContext) — muted
// autoplay on load, low default volume, visitor-controlled from there. No
// file ships in this repo — drop a royalty-free/CC-licensed, seamlessly
// loopable track at public/ambient.mp3 (pixabay.com/music has plenty with
// no attribution required), or set NEXT_PUBLIC_AMBIENT_AUDIO_URL to point
// at one hosted elsewhere, before this plays anything.
export const AMBIENT_AUDIO_URL = process.env.NEXT_PUBLIC_AMBIENT_AUDIO_URL ?? '/ambient.mp3'

// Cloudflare Turnstile site key (public — pairs with TURNSTILE_SECRET_KEY on
// the backend, which does the actual verification). Falls back to Cloudflare's
// official "always passes" test key so local dev works without setup —
// swap in the real site key via env for anything beyond localhost.
export const TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'