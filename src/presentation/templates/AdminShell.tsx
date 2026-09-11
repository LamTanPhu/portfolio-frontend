'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'
import { AdminNav } from '../organisms/AdminNav'
import { AdminExplorer } from '../organisms/AdminExplorer'

// =============================================================================
// AdminShell — Template
// The real auth gate (see AuthContext's own comment on why middleware.ts
// can't be — this checks `status` from client state, not a cookie guess).
// Markup lives in AdminNav (top bar) + AdminExplorer (sidebar) — this
// template only owns gate logic + composition, same split VSCodeLayout uses
// for TabBar/Sidebar/StatusBar. ToastProvider is scoped here so every admin
// page can call useToast() without each one wiring its own provider.
//
// 'loading'         — still trying silent refresh on mount, show nothing yet
//                      (avoids a flash of the login form for an already-
//                      authenticated admin on every page load)
// 'unauthenticated'  — bounce to /admin/login
// 'authenticated'    — render the shell + whatever page asked for it
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
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-(--text-muted)">loading</span>
                    <span className="w-2 h-4 bg-(--accent-teal) animate-pulse" aria-hidden />
                </div>
            </div>
        )
    }

    return (
        <ToastProvider>
            <div className="flex flex-col h-screen bg-(--bg-surface) text-(--text-primary)">
                <AdminNav onLogout={() => { void logout().then(() => router.replace('/admin/login')) }} />
                <div className="flex flex-1 overflow-hidden">
                    <AdminExplorer />
                    <main className="flex-1 overflow-y-auto glow-bg">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    )
}
