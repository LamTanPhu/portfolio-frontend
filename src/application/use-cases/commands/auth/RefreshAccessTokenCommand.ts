import type { IAuthRepository, AuthResult } from '../../../../domain/repositories/auth/IAuthRepository'
import { HttpApiClient }    from '../../../../infrastructure/api/HttpApiClient'
import { ApiAuthRepository } from '../../../../infrastructure/repositories/ApiAuthRepository'

// =============================================================================
// RefreshAccessTokenCommand
// Called once on mount by AuthProvider to silently re-authenticate using the
// httpOnly refresh cookie — no password re-entry needed as long as the
// cookie is still valid. Also the mechanism a 401 handler would call to
// retry a request with a fresh token (not wired yet — no other admin API
// calls exist in this codebase to retry).
// =============================================================================
export class RefreshAccessTokenCommand {
    constructor(private readonly repo: IAuthRepository) {}

    static create(): RefreshAccessTokenCommand {
        const client = new HttpApiClient()
        const repo   = new ApiAuthRepository(client)
        return new RefreshAccessTokenCommand(repo)
    }

    async execute(): Promise<AuthResult> {
        return this.repo.refresh()
    }
}