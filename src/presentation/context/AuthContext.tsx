'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { LoginCommand }              from '@/src/application/use-cases/commands/auth/LoginCommand'
import { RefreshAccessTokenCommand } from '@/src/application/use-cases/commands/auth/RefreshAccessTokenCommand'
import { LogoutCommand } from '@/src/application/use-cases/commands/auth/LogoutCommand'

// =============================================================================
// AuthContext
// Single-admin session. The access token lives in memory only (React state)
// — never localStorage, never a readable cookie. On mount, silently calls
// /auth/refresh (backed by the httpOnly refresh cookie) to re-establish a
// session without asking for the password again. If that fails, the visitor
// is simply unauthenticated — expected for anyone who isn't the admin, not
// an error worth surfacing.
//
// middleware.ts does a coarse, cookie-presence-only check to keep obviously
// logged-out visitors off /admin/* without hitting the API; this context is
// the real gate — anything behind it should treat `status` as the source
// of truth, not the middleware redirect alone.
// =============================================================================
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
    status:      AuthStatus
    accessToken: string | null
    login:       (password: string) => Promise<void>
    logout:      () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus]           = useState<AuthStatus>('loading')
    const [accessToken, setAccessToken] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        RefreshAccessTokenCommand.create()
            .execute()
            .then((result) => {
                if (cancelled) return
                setAccessToken(result.accessToken)
                setStatus('authenticated')
            })
            .catch(() => {
                // No valid refresh cookie — normal for any non-admin visitor.
                if (cancelled) return
                setAccessToken(null)
                setStatus('unauthenticated')
            })

        return () => { cancelled = true }
    }, [])

    const login = useCallback(async (password: string) => {
        const result = await LoginCommand.create().execute(password)
        setAccessToken(result.accessToken)
        setStatus('authenticated')
    }, [])

    const logout = useCallback(async () => {
        try {
            if (accessToken) {
                await LogoutCommand.create().execute(accessToken)
            }
        } finally {
            // Clear local session regardless of whether the server call
            // succeeded — the visitor's intent is to log out either way.
            setAccessToken(null)
            setStatus('unauthenticated')
        }
    }, [accessToken])

    return (
        <AuthContext.Provider value={{ status, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return ctx
}