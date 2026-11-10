import { afterEach, describe, expect, it, vi } from 'vitest'

// The real snapshot is regenerated from live data, so tests pin their own.
vi.mock('@/data/api-snapshot.json', () => ({
    default: { generatedAt: '2026-11-01T00:00:00.000Z', entries: { '/blogs': [{ id: 7 }] } },
}))

import { createServerApiClient } from './createServerApiClient'

const fetchMock = vi.fn<typeof fetch>()

afterEach(() => {
    fetchMock.mockReset()
})

describe('createServerApiClient', () => {
    it('serves the snapshot and logs to stderr when the backend is down', async () => {
        vi.stubGlobal('fetch', fetchMock)
        fetchMock.mockRejectedValue(new TypeError('fetch failed'))
        const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true)

        await expect(createServerApiClient().get('/blogs')).resolves.toEqual([{ id: 7 }])

        expect(stderr).toHaveBeenCalledWith(expect.stringContaining('[snapshot-fallback] GET /blogs'))
        expect(stderr).toHaveBeenCalledWith(expect.stringContaining('2026-11-01T00:00:00.000Z'))
    })

    it('says so when the snapshot is still the never-generated placeholder', async () => {
        vi.resetModules()
        vi.doMock('@/data/api-snapshot.json', () => ({ default: { generatedAt: null, entries: { '/blogs': [] } } }))
        const { createServerApiClient: fresh } = await import('./createServerApiClient')
        vi.stubGlobal('fetch', fetchMock)
        fetchMock.mockRejectedValue(new TypeError('fetch failed'))
        const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true)

        await fresh().get('/blogs')

        expect(stderr).toHaveBeenCalledWith(expect.stringContaining('never (placeholder)'))
        vi.doUnmock('@/data/api-snapshot.json')
    })

    it('honours SNAPSHOT_FALLBACK_TIMEOUT_MS', async () => {
        vi.useFakeTimers()
        vi.stubEnv('SNAPSHOT_FALLBACK_TIMEOUT_MS', '250')
        vi.stubGlobal('fetch', fetchMock)
        fetchMock.mockImplementation(() => new Promise<never>(() => {}))
        vi.spyOn(process.stderr, 'write').mockReturnValue(true)
        try {
            const pending = createServerApiClient().get('/blogs')
            await vi.advanceTimersByTimeAsync(250)

            await expect(pending).resolves.toEqual([{ id: 7 }])
        } finally {
            vi.useRealTimers()
            vi.unstubAllEnvs()
        }
    })

    it('ignores a non-numeric SNAPSHOT_FALLBACK_TIMEOUT_MS and uses the default', async () => {
        vi.stubEnv('SNAPSHOT_FALLBACK_TIMEOUT_MS', 'abc')
        vi.stubGlobal('fetch', fetchMock)
        fetchMock.mockResolvedValue(new Response(JSON.stringify([{ id: 1 }]), { status: 200 }))

        await expect(createServerApiClient().get('/blogs')).resolves.toEqual([{ id: 1 }])
        vi.unstubAllEnvs()
    })
})
