import type { SocialAccountDTO } from '../../application/dtos/socialAccount/SocialAccountDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { SocialAccount } from '../../domain/entities/SocialAccount'
import type { ISocialAccountReadRepository } from '../../domain/repositories/social/ISocialAccountReadRepository'
import { SocialAccountMapper } from '../mappers/SocialAccountMapper'

// =============================================================================
// ApiSocialAccountAdminRepository
// Implements ISocialAccountReadRepository against the standalone GET /social
// route (same controller as the admin POST/PATCH/DELETE) rather than the
// /about/social aggregator ApiSocialAccountRepository uses. Same data — the
// backend has no separate "everything including private" admin route for
// social accounts — but keeps admin reads colocated with admin writes on
// their own resource controller. Used only by admin list/edit pages.
// =============================================================================
export class ApiSocialAccountAdminRepository implements ISocialAccountReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findPublic(): Promise<SocialAccount[]> {
        const dtos = await this.client.get<SocialAccountDTO[]>('/social')
        return dtos.map(SocialAccountMapper.toDomain)
    }
}
