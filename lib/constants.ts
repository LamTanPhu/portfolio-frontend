// NOTE: every env fallback below uses `||` rather than `??` on purpose.
// CI systems like GitHub Actions set missing secrets/vars to an empty string
// (''), and `??` only falls back on null/undefined, so '' would slip through
// and break things like `new URL(SITE_URL)` in app/layout.tsx.

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Resume PDF served for the "download resume" link on the About page and
// tracked via POST /analytics/resume-download. No file ships in this repo —
// drop the actual PDF at public/resume.pdf, or set NEXT_PUBLIC_RESUME_URL to
// point at one hosted elsewhere (e.g. a CDN URL), before this link works.
export const RESUME_URL = process.env.NEXT_PUBLIC_RESUME_URL || '/resume.pdf'

// Public site origin — used for canonical URLs, Open Graph tags, and
// sitemap.xml. No trailing slash. Falls back to localhost for dev; set
// NEXT_PUBLIC_SITE_URL in production (e.g. https://lamtanphu.dev).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

if (process.env.NODE_ENV === 'production' && siteUrl.includes('localhost')) {
    console.warn(
        'NEXT_PUBLIC_SITE_URL is not set; canonical URLs and OG tags will point at localhost.',
    )
}

export const SITE_URL = siteUrl

// Shuffled ambient background playlist (see AmbientAudioContext) — muted
// autoplay on load, low default volume, visitor-controlled from there. No
// files ship in this repo — drop 3 royalty-free/CC-licensed tracks at
// public/ambient-1.mp3, ambient-2.mp3, ambient-3.mp3 (pixabay.com/music has
// plenty with no attribution required), or set the NEXT_PUBLIC_AMBIENT_
// TRACK_n_URL vars to point at ones hosted elsewhere. Name the actual files
// descriptively — the track picker's display names come straight from
// these filenames (e.g. "lofi-coffee-shop.mp3" shows as "Lofi Coffee Shop").
export const AMBIENT_TRACK_URLS: readonly string[] = [
    process.env.NEXT_PUBLIC_AMBIENT_TRACK_1_URL || '/ambient-1.mp3',
    process.env.NEXT_PUBLIC_AMBIENT_TRACK_2_URL || '/ambient-2.mp3',
    process.env.NEXT_PUBLIC_AMBIENT_TRACK_3_URL || '/ambient-3.mp3',
]

// Cloudflare Turnstile site key (public — pairs with TURNSTILE_SECRET_KEY on
// the backend, which does the actual verification). Falls back to Cloudflare's
// official "always passes" test key so local dev works without setup —
// swap in the real site key via env for anything beyond localhost.
export const TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
