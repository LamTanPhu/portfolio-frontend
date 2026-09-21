'use client'
// app/global-error.tsx
// Next's convention for errors thrown by the ROOT layout itself (app/layout.tsx)
// — vanishingly rare here since that layout is just fonts + two context
// providers, but cheap insurance. Must render its own <html>/<body> since it
// replaces the root layout entirely, so it can't assume globals.css or any
// provider is mounted; everything here is inline and self-contained.
import Link from 'next/link'

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="en">
            <body
                style={{
                    margin:         0,
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    minHeight:      '100dvh',
                    gap:            '1rem',
                    padding:        '1.5rem',
                    textAlign:      'center',
                    fontFamily:     "'JetBrains Mono', 'Fira Code', monospace",
                    color:          '#e6e6e6',
                    background:     '#010d18',
                }}
            >
                <p style={{ fontSize: '0.75rem', color: '#6a9955' }}>{'// fatal error'}</p>
                <h1 style={{ fontSize: '1.375rem' }}>The app failed to load</h1>
                <p style={{ fontSize: '0.875rem', color: '#8a8a8a', maxWidth: '32rem' }}>
                    Something went wrong at the root of the app. Try reloading — if it keeps happening, please let me
                    know.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                        onClick={() => reset()}
                        style={{
                            fontFamily: 'inherit',
                            fontSize:   '0.75rem',
                            padding:    '0.5rem 1rem',
                            background: '#0e639c',
                            color:      '#fff',
                            border:     'none',
                            cursor:     'pointer',
                        }}
                    >
                        try again
                    </button>
                    <Link
                        href="/"
                        style={{
                            fontFamily:     'inherit',
                            fontSize:       '0.75rem',
                            padding:        '0.5rem 1rem',
                            color:          '#e6e6e6',
                            border:         '1px solid #3a3a3a',
                            textDecoration: 'none',
                            display:        'inline-flex',
                            alignItems:     'center',
                        }}
                    >
                        go home
                    </Link>
                </div>
            </body>
        </html>
    )
}
