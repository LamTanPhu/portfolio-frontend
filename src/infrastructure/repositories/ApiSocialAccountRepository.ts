import type { SocialAccountDTO } from '../../application/dtos/socialAccount/SocialAccountDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import { SocialAccount } from '../../domain/entities/SocialAccount'
import type { ISocialAccountReadRepository } from '../../domain/repositories/social/ISocialAccountReadRepository'
import { SocialAccountMapper } from '../mappers/SocialAccountMapper'

// =============================================================================
// ApiSocialAccountRepository
// findPublic — GET /about/social → SocialAccountDTO[] → SocialAccount[]
// Public read, via the About aggregator — matches ApiSkillRepository /
// ApiEducationRepository / ApiJobRepository / ApiCertificationRepository.
// Admin list/edit pages use ApiSocialAccountAdminRepository instead, which
// reads the standalone /social route colocated with the admin writes.
// =============================================================================
export class ApiSocialAccountRepository implements ISocialAccountReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findPublic(): Promise<SocialAccount[]> {
        const dtos = await this.client.get<SocialAccountDTO[]>('/about/social')
        return dtos.map(SocialAccountMapper.toDomain)
    }
}