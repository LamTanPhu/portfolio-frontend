import type { User } from '../../../../domain/entities/User'
import type { IUserReadRepository } from '../../../../domain/repositories/user/IUserReadRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiUserRepository } from '../../../../infrastructure/repositories/ApiUserRepository'

// =============================================================================
// GetUserProfileQuery
// Client-callable — admin profile is only ever fetched after login, so the
// access token comes from AuthContext, not a server loader.
// =============================================================================
export class GetUserProfileQuery {
    constructor(private readonly repo: IUserReadRepository) {}

    static create(): GetUserProfileQuery {
        const client = new HttpApiClient()
        const repo   = new ApiUserRepository(client)
        return new GetUserProfileQuery(repo)
    }

    async execute(accessToken: string): Promise<User> {
        return this.repo.getProfile(accessToken)
    }
}
