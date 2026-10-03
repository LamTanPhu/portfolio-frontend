import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import { ApiError, del, get, patch, post } from './httpClient'

// httpClient is a thin wrapper over fetch, so these tests stub fetch directly:
// MSW can't see Next-specific options like `next: { revalidate }`, and the
// exact options passed to fetch (credentials, headers) are the whole contract.
const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' }, ...init })
}

function lastCall(): [string, RequestInit] {
    const call = fetchMock.mock.calls.at(-1)
    if (!call) throw new Error('fetch was not called')
    return [call[0] as string, (call[1] ?? {}) as RequestInit]
}

beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    fetchMock.mockReset()
})

describe('ApiError', () => {
    it('carries the HTTP status and message and is an Error', () => {
        const err = new ApiError(404, 'nope')

        expect(err).toBeInstanceOf(Error)
        expect(err.status).toBe(404)
        expect(err.message).toBe('nope')
        expect(err.name).toBe('ApiError')
    })
})

describe('get', () => {
    it('requests API_URL + path and returns the parsed JSON body', async () => {
        fetchMock.mockResolvedValue(jsonResponse([{ id: 1 }]))

        const result = await get<{ id: number }[]>('/projects')

        const [url] = lastCall()
        expect(url).toBe(`${API_URL}/projects`)
        expect(result).toEqual([{ id: 1 }])
    })

    it('defaults to a 60 second revalidate window', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}))

        await get('/x')

        expect(lastCall()[1]).toMatchObject({ next: { revalidate: 60 } })
    })

    it('passes a custom revalidate value through (0 means never cache)', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}))

        await get('/x', 0)

        expect(lastCall()[1]).toMatchObject({ next: { revalidate: 0 } })
    })

    it('sends no Authorization header without an access token', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}))

        await get('/x')

        expect(lastCall()[1].headers).toEqual({})
    })

    it('sends a Bearer Authorization header when an access token is given', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}))

        await get('/admin', 0, { accessToken: 'tok123' })

        expect(lastCall()[1].headers).toEqual({ Authorization: 'Bearer tok123' })
    })

    it('throws an ApiError carrying the status for a non-2xx response', async () => {
        fetchMock.mockResolvedValue(new Response('boom', { status: 503 }))

        const error = await get('/x').catch((e: unknown) => e)

        expect(error).toBeInstanceOf(ApiError)
        expect(error).toMatchObject({ status: 503, message: 'GET /x failed: 503' })
    })

    it('lets a network failure propagate unchanged (not wrapped as ApiError)', async () => {
        fetchMock.mockRejectedValue(new TypeError('fetch failed'))

        await expect(get('/x')).rejects.toThrow(TypeError)
    })
})

describe('post', () => {
    it('sends a JSON body with a JSON content type', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ ok: true }))

        await post('/contact', { name: 'A' })

        const [url, init] = lastCall()
        expect(url).toBe(`${API_URL}/contact`)
        expect(init.method).toBe('POST')
        expect(init.body).toBe(JSON.stringify({ name: 'A' }))
        expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' })
    })

    it('uses same-origin credentials by default', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}))

        await post('/x', {})

        expect(lastCall()[1].credentials).toBe('same-origin')
    })

    it('includes cookies when withCredentials is set (needed for the refresh-token cookie)', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}))

        await post('/auth/refresh', {}, { withCredentials: true })

        expect(lastCall()[1].credentials).toBe('include')
    })

    it('adds a Bearer header alongside the JSON content type', async () => {
        fetchMock.mockResolvedValue(jsonResponse({}))

        await post('/auth/logout', {}, { accessToken: 'tok' })

        expect(lastCall()[1].headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer tok' })
    })

    it('returns undefined for a 204 No Content response instead of throwing on empty JSON', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

        await expect(post('/auth/logout', {})).resolves.toBeUndefined()
    })

    it('parses a JSON response body', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ accessToken: 'abc' }))

        await expect(post('/auth/login', { password: 'p' })).resolves.toEqual({ accessToken: 'abc' })
    })

    it.each([400, 401, 429, 500])('throws an ApiError with status %i for a failed request', async (status) => {
        fetchMock.mockResolvedValue(new Response('{}', { status }))

        await expect(post('/x', {})).rejects.toMatchObject({ name: 'ApiError', status, message: `POST /x failed: ${status}` })
    })
})

describe('patch', () => {
    it('sends a PATCH with a JSON body', async () => {
        fetchMock.mockResolvedValue(jsonResponse({ id: 1 }))

        const result = await patch('/skills/1', { name: 'Go' }, { accessToken: 't' })

        const [url, init] = lastCall()
        expect(url).toBe(`${API_URL}/skills/1`)
        expect(init.method).toBe('PATCH')
        expect(init.body).toBe(JSON.stringify({ name: 'Go' }))
        expect(result).toEqual({ id: 1 })
    })

    it('throws an ApiError for a failed request', async () => {
        fetchMock.mockResolvedValue(new Response('{}', { status: 404 }))

        await expect(patch('/skills/9', {})).rejects.toMatchObject({ status: 404, message: 'PATCH /skills/9 failed: 404' })
    })

    it('returns undefined for an empty body', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

        await expect(patch('/x', {})).resolves.toBeUndefined()
    })
})

describe('del', () => {
    it('sends a DELETE and resolves to undefined for the 204 the backend returns', async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

        await expect(del('/skills/1', { accessToken: 'tok' })).resolves.toBeUndefined()

        const [url, init] = lastCall()
        expect(url).toBe(`${API_URL}/skills/1`)
        expect(init.method).toBe('DELETE')
        expect(init.headers).toEqual({ Authorization: 'Bearer tok' })
    })

    it('throws an ApiError for a failed request', async () => {
        fetchMock.mockResolvedValue(new Response('{}', { status: 403 }))

        await expect(del('/skills/1')).rejects.toMatchObject({ status: 403, message: 'DELETE /skills/1 failed: 403' })
    })
})
