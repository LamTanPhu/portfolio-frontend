import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// lib/constants.ts reads the environment when it is first imported, so every
// test resets the module registry and re-imports it under the env it wants.
type Env = { NEXT_PUBLIC_API_URL?: string; API_URL?: string }

async function loadApiUrl(env: Env, { browser = false }: { browser?: boolean } = {}) {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_API_URL', env.NEXT_PUBLIC_API_URL)
    vi.stubEnv('API_URL', env.API_URL)
    // The suite runs in Node, so `window` is absent (= server). Defining it
    // makes the module behave as it does inside the browser bundle.
    if (browser) vi.stubGlobal('window', {})
    return (await import('./constants')).API_URL
}

describe('API_URL', () => {
    beforeEach(() => vi.resetModules())
    afterEach(() => vi.unstubAllEnvs())

    describe('on the server', () => {
        it('defaults to the local backend when nothing is configured', async () => {
            expect(await loadApiUrl({})).toBe('http://localhost:3001/api')
        })

        it('uses NEXT_PUBLIC_API_URL when API_URL is not set', async () => {
            expect(await loadApiUrl({ NEXT_PUBLIC_API_URL: 'https://api.example.com/api' })).toBe('https://api.example.com/api')
        })

        it('prefers API_URL so the server can bypass the browser-facing /api proxy', async () => {
            const url = await loadApiUrl({ NEXT_PUBLIC_API_URL: '/api', API_URL: 'https://api.example.com/api' })
            expect(url).toBe('https://api.example.com/api')
        })

        it('drops trailing slashes so paths join cleanly', async () => {
            expect(await loadApiUrl({ API_URL: 'https://api.example.com/api///' })).toBe('https://api.example.com/api')
        })

        it('fails fast with a clear message when only a relative URL is available', async () => {
            await expect(loadApiUrl({ NEXT_PUBLIC_API_URL: '/api' })).rejects.toThrow(/set API_URL/i)
        })

        it('rejects a non-http(s) API_URL', async () => {
            await expect(loadApiUrl({ API_URL: 'ftp://api.example.com/api' })).rejects.toThrow(/relative API URL/i)
        })
    })

    describe('in the browser', () => {
        it('uses the same-origin relative path so the refresh cookie stays first-party', async () => {
            expect(await loadApiUrl({ NEXT_PUBLIC_API_URL: '/api' }, { browser: true })).toBe('/api')
        })

        it('ignores the server-only API_URL', async () => {
            const url = await loadApiUrl({ NEXT_PUBLIC_API_URL: '/api', API_URL: 'https://api.example.com/api' }, { browser: true })
            expect(url).toBe('/api')
        })

        it('still defaults to the local backend for development', async () => {
            expect(await loadApiUrl({}, { browser: true })).toBe('http://localhost:3001/api')
        })
    })
})
