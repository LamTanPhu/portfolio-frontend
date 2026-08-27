import type { SocialAccount } from '../../domain/entities/SocialAccount'
import type { ISocialAccountWriteRepository } from '../../domain/repositories/social/ISocialAccountWriteRepository'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { CreateSocialAccountRequestDTO } from '../../application/dtos/socialAccount/CreateSocialAccountRequestDTO'
import type { UpdateSocialAccountRequestDTO } from '../../application/dtos/socialAccount/UpdateSocialAccountRequestDTO'
import type { SocialAccountDTO } from '../../application/dtos/socialAccount/SocialAccountDTO'
import { SocialAccountMapper } from '../mappers/SocialAccountMapper'

// =============================================================================
// ApiSocialAccountWriteRepository
// create — POST   /social
// update — PATCH  /social/:id
// delete — DELETE /social/:id
// =============================================================================
export class ApiSocialAccountWriteRepository implements ISocialAccountWriteRepository {
    constructor(private readonly client: IApiClient) {}

    async create(input: CreateSocialAccountRequestDTO, accessToken: string): Promise<SocialAccount> {
        const dto = await this.client.post<SocialAccountDTO>('/social', input, { accessToken })
        return SocialAccountMapper.toDomain(dto)
    }

    async update(id: number, input: UpdateSocialAccountRequestDTO, accessToken: string): Promise<SocialAccount> {
        const dto = await this.client.patch<SocialAccountDTO>(`/social/${id}`, input, { accessToken })
        return SocialAccountMapper.toDomain(dto)
    }

    async delete(id: number, accessToken: string): Promise<void> {
        await this.client.delete<void>(`/social/${id}`, { accessToken })
    }
}
