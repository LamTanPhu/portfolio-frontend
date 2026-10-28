import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// next.config.ts reads API_PROXY_TARGET when it is imported (Next evaluates it
// at build time), so each test re-imports it under the env it wants.
async function loadRewrites(target: string | undefined) {
    vi.resetModules()
    vi.stubEnv('API_PROXY_TARGET', target)
    const config = (await import('../next.config')).default
    return config.rewrites?.()
}

describe('next.config API proxy', () => {
    beforeEach(() => vi.resetModules())
    afterEach(() => vi.unstubAllEnvs())

    it.each([undefined, '', '   '])('adds no rewrite when API_PROXY_TARGET is %j (dev, tests, Docker)', async (target) => {
        expect(await loadRewrites(target)).toEqual([])
    })

    it('forwards /api/* to the backend, one-to-one on the path', async () => {
        expect(await loadRewrites('https://my-api.onrender.com')).toEqual([
            { source: '/api/:path*', destination: 'https://my-api.onrender.com/api/:path*' },
        ])
    })

    it('keeps only the origin, so a stray /api or trailing slash cannot produce /api/api', async () => {
        expect(await loadRewrites(' https://my-api.onrender.com/api/ ')).toEqual([
            { source: '/api/:path*', destination: 'https://my-api.onrender.com/api/:path*' },
        ])
    })

    it('allows plain http only for loopback, to test the proxy locally', async () => {
        expect(await loadRewrites('http://localhost:3001')).toEqual([
            { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' },
        ])
        expect(await loadRewrites('http://127.0.0.1:3001')).toEqual([
            { source: '/api/:path*', destination: 'http://127.0.0.1:3001/api/:path*' },
        ])
    })

    it('rejects plain http to a real host, which would send cookies and tokens in clear text', async () => {
        await expect(loadRewrites('http://my-api.onrender.com')).rejects.toThrow(/must use https/i)
    })

    it('rejects other protocols', async () => {
        await expect(loadRewrites('ftp://my-api.onrender.com')).rejects.toThrow(/must use https/i)
    })

    it('rejects a value that is not an absolute URL, so a typo fails the build', async () => {
        await expect(loadRewrites('my-api.onrender.com')).rejects.toThrow(/absolute URL/i)
    })
})
