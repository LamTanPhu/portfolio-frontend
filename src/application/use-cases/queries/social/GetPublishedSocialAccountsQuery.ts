import type { ISocialAccountReadRepository } from '../../../../domain/repositories/social/ISocialAccountReadRepository'
import type { SocialAccountDTO } from '../../../dtos/socialAccount/SocialAccountDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSocialAccountAdminRepository } from '../../../../infrastructure/repositories/ApiSocialAccountAdminRepository'

// =============================================================================
// GetPublishedSocialAccountsQuery
// Returns all public social accounts for display.
//
// Two valid compositions of the same query, same data, different route —
// see GetPublishedSkillsQuery for the full rationale. loadSocialAccounts.ts
// wires the default (public, /about/social); createForAdmin() wires the
// standalone /social route for admin list/edit pages instead.
// =============================================================================
export class GetPublishedSocialAccountsQuery {
    constructor(private readonly repo: ISocialAccountReadRepository) {}

    static createForAdmin(): GetPublishedSocialAccountsQuery {
        const client = new HttpApiClient()
        const repo   = new ApiSocialAccountAdminRepository(client)
        return new GetPublishedSocialAccountsQuery(repo)
    }

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