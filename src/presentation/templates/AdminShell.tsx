'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'

// =============================================================================
// AdminShell — Template
// The real auth gate (see AuthContext's own comment on why middleware.ts
// can't be — this checks `status` from client state, not a cookie guess).
//
// 'loading'        — still trying silent refresh on mount, show nothing yet
//                     (avoids a flash of the login form for an already-
//                     authenticated admin on every page load)
// 'unauthenticated' — bounce to /admin/login
// 'authenticated'   — render the admin nav + whatever page asked for this shell
//
// Lives outside app/admin/login/ (see the (protected) route group) so the
// login page itself is never wrapped by this gate — wrapping it would
// redirect-loop against itself.
// =============================================================================
export function AdminShell({ children }: { children: ReactNode }) {
    const { status, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/admin/login')
        }
    }, [status, router])

    if (status !== 'authenticated') {
        return (
            <div className="flex items-center justify-center h-screen bg-(--bg-surface)">
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-(--bg-surface) text-(--text-primary)">
            <header className="flex items-center justify-between px-6 py-4 border-b border-(--border-muted) shrink-0">
                <nav className="flex items-center gap-6">
                    <span className="font-mono text-sm text-(--accent-teal)">_admin</span>
                    <Link href="/admin/blog" className="font-mono text-sm text-(--text-muted) hover:text-(--text-primary) transition-colors">
                        blog
                    </Link>
                    {/* More sections (projects, skills, jobs, education, certifications,
                        social, profile) follow the same pattern as blog once needed. */}
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors">
                        ← back to site
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            void logout().then(() => router.replace('/admin/login'))
                        }}
                    >
                        logout
                    </Button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
