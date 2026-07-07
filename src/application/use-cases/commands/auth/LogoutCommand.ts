import type { IAuthRepository } from '../../../../domain/repositories/auth/IAuthRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiAuthRepository } from '../../../../infrastructure/repositories/ApiAuthRepository'

// =============================================================================
// LogoutCommand
// Needs the current access token (JwtAuthGuard on the backend) — pass
// whatever AuthContext currently holds in memory.
// =============================================================================
export class LogoutCommand {
    constructor(private readonly repo: IAuthRepository) {}

    static create(): LogoutCommand {
        const client = new HttpApiClient()
        const repo   = new ApiAuthRepository(client)
        return new LogoutCommand(repo)
    }

    async execute(accessToken: string): Promise<void> {
        await this.repo.logout(accessToken)
    }
}