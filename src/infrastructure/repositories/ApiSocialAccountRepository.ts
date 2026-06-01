import type { ISocialAccountReadRepository } from '../../domain/repositories/social/ISocialAccountReadRepository'
import { SocialAccount }       from '../../domain/entities/SocialAccount'
import { SocialAccountMapper } from '../mappers/SocialAccountMapper'
import type { SocialAccountDTO } from '../../application/dtos/SocialAccountDTO'
import { get }                 from '../api/httpClient'

// =============================================================================
// ApiSocialAccountRepository
// Implements ISocialAccountReadRepository using the backend REST API.
// =============================================================================
export class ApiSocialAccountRepository implements ISocialAccountReadRepository {
    async findPublic(): Promise<SocialAccount[]> {
        const dtos = await get<SocialAccountDTO[]>('/social')
        return dtos.map(SocialAccountMapper.toDomain)
    }
}