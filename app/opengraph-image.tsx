// app/opengraph-image.tsx
// Site-wide fallback social-share image (og:image + twitter:image, which
// falls back to og:image when not set separately). Any route segment that
// declares its own `openGraph.images` (blog/project detail pages, when a
// thumbnail exists) overrides this; every other page — home, about,
// projects list, blog list, contact — had no image at all before this and
// now inherits this one automatically, no per-page wiring needed.
//
// Generated at build time via next/og rather than a static asset: no
// external font fetch (this sandbox can't reach Google Fonts anyway), just
// the same CSS variables/colors used everywhere else, inlined as literals
// since ImageResponse renders in an isolated context without access to
// globals.css.
import { ImageResponse } from 'next/og'

export const alt = 'Lam Tan Phu — Software Engineer & Portfolio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width:          '100%',
                    height:         '100%',
                    display:        'flex',
                    flexDirection:  'column',
                    justifyContent: 'center',
                    padding:        '80px',
                    background:     '#010d18',
                    fontFamily:     'monospace',
                }}
            >
                {/* Terminal window chrome */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 48 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 999, background: '#f14c4c' }} />
                    <div style={{ width: 16, height: 16, borderRadius: 999, background: '#e5b95c' }} />
                    <div style={{ width: 16, height: 16, borderRadius: 999, background: '#3dd68c' }} />
                </div>

                <div style={{ display: 'flex', fontSize: 30, color: '#6a9955' }}>
                    {'// software engineer & portfolio'}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 16 }}>
                    <div style={{ display: 'flex', fontSize: 72, color: '#4ec9b0' }}>const&nbsp;</div>
                    <div style={{ display: 'flex', fontSize: 72, color: '#e6e6e6' }}>developer&nbsp;</div>
                    <div style={{ display: 'flex', fontSize: 72, color: '#e6e6e6' }}>=&nbsp;</div>
                    <div style={{ display: 'flex', fontSize: 72, color: '#ce9178' }}>&apos;lam-tan-phu&apos;</div>
                </div>

                <div style={{ display: 'flex', fontSize: 30, color: '#8a8a8a', marginTop: 40 }}>
                    Full-Stack Developer · Ho Chi Minh City
                </div>
            </div>
        ),
        { ...size },
    )
}
