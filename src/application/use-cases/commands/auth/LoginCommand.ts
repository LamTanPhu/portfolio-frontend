import type { AuthResult, IAuthRepository } from '../../../../domain/repositories/auth/IAuthRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiAuthRepository } from '../../../../infrastructure/repositories/ApiAuthRepository'

// =============================================================================
// LoginCommand
// Client-callable — called directly from the login form, not a Server Action,
// since the resulting access token needs to land in client-side memory
// (React state), not anywhere the server could persist it for us.
// =============================================================================
export class LoginCommand {
    constructor(private readonly repo: IAuthRepository) {}

    static create(): LoginCommand {
        const client = new HttpApiClient()
        const repo   = new ApiAuthRepository(client)
        return new LoginCommand(repo)
    }

    async execute(password: string): Promise<AuthResult> {
        return this.repo.login(password)
    }
}