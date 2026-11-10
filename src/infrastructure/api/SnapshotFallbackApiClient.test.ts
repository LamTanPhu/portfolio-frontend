import { describe, expect, it, vi } from 'vitest'
import type { IApiClient } from '../../application/ports/IApiClient'
import { ApiError } from './httpClient'
import { SnapshotFallbackApiClient, type ApiSnapshot } from './SnapshotFallbackApiClient'

const snapshot: ApiSnapshot = {
    generatedAt: '2026-11-01T00:00:00.000Z',
    entries: { '/projects': [{ id: 1, title: 'Snap' }], '/projects/snap': { id: 1 } },
}

function makeInner(overrides: Partial<IApiClient> = {}): IApiClient {
    return {
        get: vi.fn().mockResolvedValue('live'),
        post: vi.fn().mockResolvedValue('posted'),
        patch: vi.fn().mockResolvedValue('patched'),
        delete: vi.fn().mockResolvedValue('deleted'),
        ...overrides,
    } as IApiClient
}

describe('SnapshotFallbackApiClient.get', () => {
    it('returns live data and never touches the snapshot when the backend is healthy', async () => {
        const inner = makeInner()
        const onFallback = vi.fn()
        const client = new SnapshotFallbackApiClient(inner, snapshot, { onFallback })

        await expect(client.get('/projects', 30)).resolves.toBe('live')
        expect(inner.get).toHaveBeenCalledWith('/projects', 30, undefined)
        expect(onFallback).not.toHaveBeenCalled()
    })

    it.each([
        ['a network error', () => Promise.reject(new TypeError('fetch failed'))],
        ['a 500', () => Promise.reject(new ApiError(500, 'boom'))],
        ['a 503 (host waking up)', () => Promise.reject(new ApiError(503, 'wake'))],
        ['a 429', () => Promise.reject(new ApiError(429, 'slow down'))],
    ])('serves the snapshot on %s and reports why', async (_label, fail) => {
        const onFallback = vi.fn()
        const client = new SnapshotFallbackApiClient(makeInner({ get: vi.fn(fail) }), snapshot, { onFallback })

        await expect(client.get('/projects')).resolves.toEqual([{ id: 1, title: 'Snap' }])
        expect(onFallback).toHaveBeenCalledWith(
            expect.objectContaining({ path: '/projects', generatedAt: snapshot.generatedAt }),
        )
    })

    it('reports a non-Error rejection as a string', async () => {
        const onFallback = vi.fn()
        const client = new SnapshotFallbackApiClient(
            makeInner({ get: vi.fn(() => Promise.reject('plain string')) }),
            snapshot,
            { onFallback },
        )

        await client.get('/projects')

        expect(onFallback).toHaveBeenCalledWith(expect.objectContaining({ reason: 'plain string' }))
    })

    it('serves the snapshot when the backend does not answer within the timeout', async () => {
        vi.useFakeTimers()
        try {
            const onFallback = vi.fn()
            const hang = vi.fn(() => new Promise<never>(() => {}))
            const client = new SnapshotFallbackApiClient(makeInner({ get: hang }), snapshot, { timeoutMs: 5000, onFallback })

            const pending = client.get('/projects')
            await vi.advanceTimersByTimeAsync(5000)

            await expect(pending).resolves.toEqual([{ id: 1, title: 'Snap' }])
            expect(onFallback).toHaveBeenCalledWith(expect.objectContaining({ reason: 'no response within 5000ms' }))
        } finally {
            vi.useRealTimers()
        }
    })

    it('swallows a request that fails after the timeout already fired (no unhandled rejection)', async () => {
        vi.useFakeTimers()
        try {
            let rejectLate: (e: Error) => void = () => {}
            const slow = vi.fn(() => new Promise<never>((_, reject) => { rejectLate = reject }))
            const client = new SnapshotFallbackApiClient(makeInner({ get: slow }), snapshot, { timeoutMs: 100 })

            const pending = client.get('/projects')
            await vi.advanceTimersByTimeAsync(100)
            await pending
            rejectLate(new Error('too late'))
            await vi.advanceTimersByTimeAsync(0)
        } finally {
            vi.useRealTimers()
        }
    })

    it('waits indefinitely when timeoutMs is 0', async () => {
        vi.useFakeTimers()
        try {
            const inner = makeInner({
                get: vi.fn(
                    () => new Promise((resolve) => setTimeout(() => resolve('eventually'), 60_000)),
                ) as IApiClient['get'],
            })
            const client = new SnapshotFallbackApiClient(inner, snapshot, { timeoutMs: 0 })

            const pending = client.get('/projects')
            await vi.advanceTimersByTimeAsync(60_000)

            await expect(pending).resolves.toBe('eventually')
        } finally {
            vi.useRealTimers()
        }
    })

    it('rethrows a 404 — a genuine "not found" must never become stale data', async () => {
        const notFound = new ApiError(404, 'nope')
        const client = new SnapshotFallbackApiClient(makeInner({ get: vi.fn().mockRejectedValue(notFound) }), snapshot)

        await expect(client.get('/projects/snap')).rejects.toBe(notFound)
    })

    it('rethrows other 4xx errors', async () => {
        const forbidden = new ApiError(403, 'no')
        const client = new SnapshotFallbackApiClient(makeInner({ get: vi.fn().mockRejectedValue(forbidden) }), snapshot)

        await expect(client.get('/projects')).rejects.toBe(forbidden)
    })

    it('rethrows the original error for a path that is not in the snapshot', async () => {
        const boom = new ApiError(500, 'boom')
        const client = new SnapshotFallbackApiClient(makeInner({ get: vi.fn().mockRejectedValue(boom) }), snapshot)

        await expect(client.get('/projects/other')).rejects.toBe(boom)
    })

    it('does not treat Object.prototype keys as snapshot entries', async () => {
        const boom = new TypeError('fetch failed')
        const client = new SnapshotFallbackApiClient(makeInner({ get: vi.fn().mockRejectedValue(boom) }), snapshot)

        await expect(client.get('constructor')).rejects.toBe(boom)
    })

    it('never serves the snapshot for authenticated reads (admin screens must be live)', async () => {
        const boom = new ApiError(500, 'boom')
        const inner = makeInner({ get: vi.fn().mockRejectedValue(boom) })
        const client = new SnapshotFallbackApiClient(inner, snapshot)

        await expect(client.get('/projects', 0, { accessToken: 't' })).rejects.toBe(boom)
        expect(inner.get).toHaveBeenCalledWith('/projects', 0, { accessToken: 't' })
    })

    it('hands out a copy, so a caller mutating the result cannot corrupt later reads', async () => {
        const client = new SnapshotFallbackApiClient(
            makeInner({ get: vi.fn().mockRejectedValue(new ApiError(500, 'x')) }),
            snapshot,
        )

        const first = await client.get<{ title: string }[]>('/projects')
        first[0].title = 'mutated'

        await expect(client.get('/projects')).resolves.toEqual([{ id: 1, title: 'Snap' }])
    })
})

describe('SnapshotFallbackApiClient writes', () => {
    it('passes post, patch and delete straight through, errors included', async () => {
        const failing = new ApiError(500, 'boom')
        const inner = makeInner({ post: vi.fn().mockRejectedValue(failing) })
        const client = new SnapshotFallbackApiClient(inner, snapshot)

        await expect(client.post('/projects', { a: 1 }, { accessToken: 't' })).rejects.toBe(failing)
        await expect(client.patch('/projects/1', { a: 2 })).resolves.toBe('patched')
        await expect(client.delete('/projects/1')).resolves.toBe('deleted')
        expect(inner.post).toHaveBeenCalledWith('/projects', { a: 1 }, { accessToken: 't' })
    })
})
