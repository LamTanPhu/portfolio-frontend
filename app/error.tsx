'use client'
// app/error.tsx
// Next's error-boundary convention — catches any uncaught render/data error
// below the root layout. Deliberately minimal and self-contained (plain
// <a>/<button>, no VSCodeLayout, no other app components): if something
// broke badly enough to land here, this file shouldn't add more surface
// area that could itself fail. It still reuses the site's CSS variables
// and font, which are loaded independently of the React tree, so it
// doesn't look like a foreign screen.
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div
            style={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                minHeight:      '100dvh',
                gap:            '1rem',
                padding:        '1.5rem',
                textAlign:      'center',
                fontFamily:     "'JetBrains Mono', 'Fira Code', monospace",
                color:          'var(--text-primary)',
                background:     'var(--bg-surface)',
            }}
        >
            <p style={{ fontSize: '0.75rem', color: 'var(--text-comment)' }}>{'// uncaught exception'}</p>

            <h1 style={{ fontSize: '1.375rem' }}>Something broke</h1>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '32rem' }}>
                An unexpected error stopped this page from rendering. It&apos;s been logged — try again, or head back
                home.
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
                        fontFamily:      'inherit',
                        fontSize:        '0.75rem',
                        padding:         '0.5rem 1rem',
                        color:           'var(--text-primary)',
                        border:          '1px solid var(--border-muted)',
                        textDecoration:  'none',
                        display:         'inline-flex',
                        alignItems:      'center',
                    }}
                >
                    go home
                </Link>
            </div>
        </div>
    )
}
