import type { ISocialAccountReadRepository } from '../../../../domain/repositories/social/ISocialAccountReadRepository'
import type { SocialAccountDTO } from '../../../dtos/socialAccount/SocialAccountDTO'

// =============================================================================
// GetPublishedSocialAccountsQuery
// Returns all public social accounts for display.
// =============================================================================
export class GetPublishedSocialAccountsQuery {
    constructor(private readonly repo: ISocialAccountReadRepository) {}

    async execute(): Promise<SocialAccountDTO[]> {
        const accounts = await this.repo.findPublic()
        return accounts.map((a) => ({
            id:       a.id,
            name:     a.name,
            url:      a.url,
            imageUrl: a.imageUrl,
            isPublic: true,
        }))
    }
}