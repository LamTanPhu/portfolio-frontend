import { beforeEach, describe, expect, it } from 'vitest'
import { RateLimitedError } from '@/src/domain/errors/RateLimitedError'
import { ServerError } from '@/src/domain/errors/ServerError'
import { ValidationError } from '@/src/domain/errors/ValidationError'
import { createApiClientMock } from '@/src/test/apiClientMock'
import { ApiError } from '../api/httpClient'
import { ApiContactRepository } from './ApiContactRepository'

const submission = {
    name: 'Ada',
    email: 'ada@example.com',
    message: 'Hello there',
    turnstileToken: 'ts-token',
    snakeProofToken: 'snake-token',
}

describe('ApiContactRepository', () => {
    let client: ReturnType<typeof createApiClientMock>
    let repo: ApiContactRepository

    beforeEach(() => {
        client = createApiClientMock()
        repo = new ApiContactRepository(client)
    })

    describe('save', () => {
        it('POSTs the whole submission (including both anti-bot tokens) to /contact', async () => {
            client.post.mockResolvedValue({})

            await repo.save(submission)

            expect(client.post).toHaveBeenCalledWith('/contact', submission)
        })

        it('turns a 400 into a ValidationError that keeps the API error message', async () => {
            client.post.mockRejectedValue(new ApiError(400, 'POST /contact failed: 400'))

            const error = await repo.save(submission).catch((e: unknown) => e)

            expect(error).toBeInstanceOf(ValidationError)
            expect((error as Error).message).toBe('POST /contact failed: 400')
        })

        it('turns a 429 into a RateLimitedError with a user-facing message', async () => {
            client.post.mockRejectedValue(new ApiError(429, 'too many'))

            const error = await repo.save(submission).catch((e: unknown) => e)

            expect(error).toBeInstanceOf(RateLimitedError)
            expect((error as Error).message).toMatch(/too many messages/i)
        })

        it.each([401, 403, 500, 502, 503])('turns a %i into a ServerError', async (status) => {
            client.post.mockRejectedValue(new ApiError(status, 'x'))

            const error = await repo.save(submission).catch((e: unknown) => e)

            expect(error).toBeInstanceOf(ServerError)
            expect((error as Error).message).toMatch(/server failed/i)
        })

        it('treats a network failure (not an ApiError) as a ServerError about connectivity', async () => {
            client.post.mockRejectedValue(new TypeError('fetch failed'))

            const error = await repo.save(submission).catch((e: unknown) => e)

            expect(error).toBeInstanceOf(ServerError)
            expect((error as Error).message).toMatch(/could not reach the server/i)
        })

        it('resolves with no value on success', async () => {
            client.post.mockResolvedValue({ id: 1 })

            await expect(repo.save(submission)).resolves.toBeUndefined()
        })
    })

    describe('findMessages', () => {
        it('requests /contact uncached with the access token when no paging is given', async () => {
            client.get.mockResolvedValue({ items: [], nextCursor: null })

            await repo.findMessages('tok')

            expect(client.get).toHaveBeenCalledWith('/contact', 0, { accessToken: 'tok' })
        })

        it('adds cursor and limit as query params', async () => {
            client.get.mockResolvedValue({ items: [], nextCursor: null })

            await repo.findMessages('tok', 42, 10)

            expect(client.get).toHaveBeenCalledWith('/contact?cursor=42&limit=10', 0, { accessToken: 'tok' })
        })

        it('keeps a cursor of 0 instead of dropping it as falsy', async () => {
            client.get.mockResolvedValue({ items: [], nextCursor: null })

            await repo.findMessages('tok', 0)

            expect(client.get).toHaveBeenCalledWith('/contact?cursor=0', 0, { accessToken: 'tok' })
        })

        it('supports a limit without a cursor', async () => {
            client.get.mockResolvedValue({ items: [], nextCursor: null })

            await repo.findMessages('tok', undefined, 5)

            expect(client.get).toHaveBeenCalledWith('/contact?limit=5', 0, { accessToken: 'tok' })
        })
    })

    describe('delete', () => {
        it('DELETEs /contact/:id with the access token', async () => {
            client.delete.mockResolvedValue(undefined)

            await repo.delete(7, 'tok')

            expect(client.delete).toHaveBeenCalledWith('/contact/7', { accessToken: 'tok' })
        })
    })
})
