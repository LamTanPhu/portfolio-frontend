import type { SocialAccountDTO } from '../../application/dtos/socialAccount/SocialAccountDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import { SocialAccount } from '../../domain/entities/SocialAccount'
import type { ISocialAccountReadRepository } from '../../domain/repositories/social/ISocialAccountReadRepository'
import { SocialAccountMapper } from '../mappers/SocialAccountMapper'

// =============================================================================
// ApiSocialAccountRepository
// Implements ISocialAccountReadRepository using the backend REST API.
// =============================================================================
export class ApiSocialAccountRepository implements ISocialAccountReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findPublic(): Promise<SocialAccount[]> {
        const dtos = await this.client.get<SocialAccountDTO[]>('/social')
        return dtos.map(SocialAccountMapper.toDomain)
    }
}