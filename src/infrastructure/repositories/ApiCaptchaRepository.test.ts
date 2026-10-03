import { beforeEach, describe, expect, it } from 'vitest'
import { RateLimitedError } from '@/src/domain/errors/RateLimitedError'
import { ServerError } from '@/src/domain/errors/ServerError'
import { createApiClientMock } from '@/src/test/apiClientMock'
import { ApiError } from '../api/httpClient'
import { ApiCaptchaRepository } from './ApiCaptchaRepository'

describe('ApiCaptchaRepository', () => {
    let client: ReturnType<typeof createApiClientMock>
    let repo: ApiCaptchaRepository

    beforeEach(() => {
        client = createApiClientMock()
        repo = new ApiCaptchaRepository(client)
    })

    describe('issueSnakeChallenge', () => {
        it('POSTs an empty body to the challenge endpoint and returns the challenge id', async () => {
            client.post.mockResolvedValue({ challengeId: 'abc-123' })

            await expect(repo.issueSnakeChallenge()).resolves.toBe('abc-123')
            expect(client.post).toHaveBeenCalledWith('/captcha/snake/challenge', {})
        })

        it('turns a 429 into a RateLimitedError', async () => {
            client.post.mockRejectedValue(new ApiError(429, 'x'))

            await expect(repo.issueSnakeChallenge()).rejects.toBeInstanceOf(RateLimitedError)
        })

        it.each([400, 500, 503])('turns a %i into a ServerError', async (status) => {
            client.post.mockRejectedValue(new ApiError(status, 'x'))

            await expect(repo.issueSnakeChallenge()).rejects.toBeInstanceOf(ServerError)
        })

        it('turns a network failure into a ServerError', async () => {
            client.post.mockRejectedValue(new TypeError('fetch failed'))

            await expect(repo.issueSnakeChallenge()).rejects.toBeInstanceOf(ServerError)
        })
    })

    describe('verifySnakeCompletion', () => {
        const report = { challengeId: 'abc-123', score: 10, durationMs: 15_000 } as unknown as Parameters<
            ApiCaptchaRepository['verifySnakeCompletion']
        >[0]

        it('POSTs the completion report and returns the proof token', async () => {
            client.post.mockResolvedValue({ proofToken: 'proof-xyz' })

            await expect(repo.verifySnakeCompletion(report)).resolves.toBe('proof-xyz')
            expect(client.post).toHaveBeenCalledWith('/captcha/snake/verify', report)
        })

        it('returns null (does not throw) on a 400, which is the ordinary "run did not check out" outcome', async () => {
            client.post.mockRejectedValue(new ApiError(400, 'x'))

            await expect(repo.verifySnakeCompletion(report)).resolves.toBeNull()
        })

        it('turns a 429 into a RateLimitedError', async () => {
            client.post.mockRejectedValue(new ApiError(429, 'x'))

            await expect(repo.verifySnakeCompletion(report)).rejects.toBeInstanceOf(RateLimitedError)
        })

        it.each([401, 500, 502])('turns a %i into a ServerError', async (status) => {
            client.post.mockRejectedValue(new ApiError(status, 'x'))

            await expect(repo.verifySnakeCompletion(report)).rejects.toBeInstanceOf(ServerError)
        })

        it('turns a network failure into a ServerError', async () => {
            client.post.mockRejectedValue(new TypeError('fetch failed'))

            await expect(repo.verifySnakeCompletion(report)).rejects.toBeInstanceOf(ServerError)
        })
    })
})
