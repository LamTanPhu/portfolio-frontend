// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'

const refresh = vi.hoisted(() => vi.fn())
const login = vi.hoisted(() => vi.fn())
const logout = vi.hoisted(() => vi.fn())

vi.mock('@/src/application/use-cases/commands/auth/RefreshAccessTokenCommand', () => ({
    RefreshAccessTokenCommand: { create: () => ({ execute: refresh }) },
}))
vi.mock('@/src/application/use-cases/commands/auth/LoginCommand', () => ({
    LoginCommand: { create: () => ({ execute: login }) },
}))
vi.mock('@/src/application/use-cases/commands/auth/LogoutCommand', () => ({
    LogoutCommand: { create: () => ({ execute: logout }) },
}))

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

beforeEach(() => {
    refresh.mockReset()
    login.mockReset()
    logout.mockReset()
})

describe('useAuth', () => {
    it('throws a helpful error outside an AuthProvider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})

        expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider')
    })
})

describe('AuthProvider', () => {
    it('starts in "loading" while the silent refresh is in flight', () => {
        refresh.mockReturnValue(new Promise(() => {}))

        const { result } = renderHook(() => useAuth(), { wrapper })

        expect(result.current.status).toBe('loading')
        expect(result.current.accessToken).toBeNull()
    })

    it('becomes authenticated when the refresh cookie is valid', async () => {
        refresh.mockResolvedValue({ accessToken: 'tok-1' })

        const { result } = renderHook(() => useAuth(), { wrapper })

        await waitFor(() => expect(result.current.status).toBe('authenticated'))
        expect(result.current.accessToken).toBe('tok-1')
    })

    it('becomes unauthenticated (quietly) when there is no valid refresh cookie', async () => {
        refresh.mockRejectedValue(new Error('401'))

        const { result } = renderHook(() => useAuth(), { wrapper })

        await waitFor(() => expect(result.current.status).toBe('unauthenticated'))
        expect(result.current.accessToken).toBeNull()
    })

    it('login stores the access token and authenticates', async () => {
        refresh.mockRejectedValue(new Error('401'))
        login.mockResolvedValue({ accessToken: 'tok-2' })
        const { result } = renderHook(() => useAuth(), { wrapper })
        await waitFor(() => expect(result.current.status).toBe('unauthenticated'))

        await act(() => result.current.login('hunter2'))

        expect(login).toHaveBeenCalledWith('hunter2')
        expect(result.current.status).toBe('authenticated')
        expect(result.current.accessToken).toBe('tok-2')
    })

    it('a failed login rejects and leaves the visitor unauthenticated', async () => {
        refresh.mockRejectedValue(new Error('401'))
        login.mockRejectedValue(new Error('wrong password'))
        const { result } = renderHook(() => useAuth(), { wrapper })
        await waitFor(() => expect(result.current.status).toBe('unauthenticated'))

        await expect(act(() => result.current.login('bad'))).rejects.toThrow('wrong password')

        expect(result.current.status).toBe('unauthenticated')
        expect(result.current.accessToken).toBeNull()
    })

    it('logout calls the API with the current token, then clears the session', async () => {
        refresh.mockResolvedValue({ accessToken: 'tok-3' })
        logout.mockResolvedValue(undefined)
        const { result } = renderHook(() => useAuth(), { wrapper })
        await waitFor(() => expect(result.current.status).toBe('authenticated'))

        await act(() => result.current.logout())

        expect(logout).toHaveBeenCalledWith('tok-3')
        expect(result.current.status).toBe('unauthenticated')
        expect(result.current.accessToken).toBeNull()
    })

    it('logout clears the local session even when the server call fails', async () => {
        refresh.mockResolvedValue({ accessToken: 'tok-4' })
        logout.mockRejectedValue(new Error('network'))
        const { result } = renderHook(() => useAuth(), { wrapper })
        await waitFor(() => expect(result.current.status).toBe('authenticated'))

        // Catch inside act() so React flushes the state updates made in logout's `finally`.
        let thrown: unknown
        await act(async () => {
            try { await result.current.logout() } catch (e) { thrown = e }
        })

        expect(thrown).toMatchObject({ message: 'network' }) // the failure still reaches the caller
        expect(result.current.status).toBe('unauthenticated')
        expect(result.current.accessToken).toBeNull()
    })

    it('logout without a token skips the API call', async () => {
        refresh.mockRejectedValue(new Error('401'))
        const { result } = renderHook(() => useAuth(), { wrapper })
        await waitFor(() => expect(result.current.status).toBe('unauthenticated'))

        await act(() => result.current.logout())

        expect(logout).not.toHaveBeenCalled()
    })
})
