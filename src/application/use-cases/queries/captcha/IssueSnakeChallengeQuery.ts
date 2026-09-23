import type { ICaptchaRepository } from '../../../../domain/repositories/captcha/ICaptchaRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiCaptchaRepository } from '../../../../infrastructure/repositories/ApiCaptchaRepository'

// =============================================================================
// IssueSnakeChallengeQuery
// Public, client-callable — invoked when SnakeCaptchaGate mounts, so a
// challenge is ready before the visitor finishes playing. Mirrors
// SearchBlogsQuery's create() pattern.
// =============================================================================
export class IssueSnakeChallengeQuery {
    constructor(private readonly repo: ICaptchaRepository) {}

    static create(): IssueSnakeChallengeQuery {
        const client = new HttpApiClient()
        const repo   = new ApiCaptchaRepository(client)
        return new IssueSnakeChallengeQuery(repo)
    }

    async execute(): Promise<string> {
        return this.repo.issueSnakeChallenge()
    }
}
