import type { ICaptchaRepository, SnakeCompletionReport } from '../../../../domain/repositories/captcha/ICaptchaRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiCaptchaRepository } from '../../../../infrastructure/repositories/ApiCaptchaRepository'

// =============================================================================
// VerifySnakeCompletionCommand
// Public, client-callable — invoked from SnakeCaptchaGate's onWin handler.
// Returns the signed proof token on success, or null on an ordinary
// verification failure (see ICaptchaRepository) — not every failure here
// is exceptional, so this deliberately doesn't throw for that case.
// =============================================================================
export class VerifySnakeCompletionCommand {
    constructor(private readonly repo: ICaptchaRepository) {}

    static create(): VerifySnakeCompletionCommand {
        const client = new HttpApiClient()
        const repo   = new ApiCaptchaRepository(client)
        return new VerifySnakeCompletionCommand(repo)
    }

    async execute(report: SnakeCompletionReport): Promise<string | null> {
        return this.repo.verifySnakeCompletion(report)
    }
}
