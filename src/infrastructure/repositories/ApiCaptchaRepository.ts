import type { IApiClient } from '../../application/ports/IApiClient'
import type { ICaptchaRepository, SnakeCompletionReport } from '../../domain/repositories/captcha/ICaptchaRepository'
import { ApiError } from '../api/httpClient'
import { RateLimitedError } from '../../domain/errors/RateLimitedError'
import { ServerError } from '../../domain/errors/ServerError'

interface ChallengeResponseDTO {
    challengeId: string
}

interface VerifyResponseDTO {
    proofToken: string
}

// =============================================================================
// ApiCaptchaRepository
// issueSnakeChallenge — POST /captcha/snake/challenge
// verifySnakeCompletion — POST /captcha/snake/verify
// Both public, no accessToken. Translates transport-level failure into
// domain errors here, same pattern as ApiContactRepository.save().
// =============================================================================
export class ApiCaptchaRepository implements ICaptchaRepository {
    constructor(private readonly client: IApiClient) {}

    async issueSnakeChallenge(): Promise<string> {
        try {
            const res = await this.client.post<ChallengeResponseDTO>('/captcha/snake/challenge', {})
            return res.challengeId
        } catch (err) {
            if (err instanceof ApiError && err.status === 429) {
                throw new RateLimitedError('Too many attempts. Please wait a moment and try again.')
            }
            throw new ServerError('Could not start the verification game. Please try again later.')
        }
    }

    async verifySnakeCompletion(report: SnakeCompletionReport): Promise<string | null> {
        try {
            const res = await this.client.post<VerifyResponseDTO>('/captcha/snake/verify', report)
            return res.proofToken
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 400) {
                    // Expected/ordinary outcome — unknown or already-used
                    // challenge, incomplete game, or implausible timing.
                    return null
                }
                if (err.status === 429) {
                    throw new RateLimitedError('Too many attempts. Please wait a moment and try again.')
                }
            }
            throw new ServerError('Could not verify — please try again.')
        }
    }
}
