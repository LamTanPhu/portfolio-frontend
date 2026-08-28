'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { AdminNav } from '../organisms/AdminNav'

// =============================================================================
// AdminShell — Template
// The real auth gate (see AuthContext's own comment on why middleware.ts
// can't be — this checks `status` from client state, not a cookie guess).
// Markup lives in AdminNav — this template only owns gate logic + composition,
// same split VSCodeLayout uses for TabBar/Sidebar/StatusBar.
//
// 'loading'         — still trying silent refresh on mount, show nothing yet
//                      (avoids a flash of the login form for an already-
//                      authenticated admin on every page load)
// 'unauthenticated'  — bounce to /admin/login
// 'authenticated'    — render AdminNav + whatever page asked for this shell
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
            <AdminNav onLogout={() => { void logout().then(() => router.replace('/admin/login')) }} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
