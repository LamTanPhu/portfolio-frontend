import type { SocialAccount } from '../../../../domain/entities/SocialAccount'
import type { ISocialAccountWriteRepository } from '../../../../domain/repositories/social/ISocialAccountWriteRepository'
import type { UpdateSocialAccountRequestDTO } from '../../../dtos/socialAccount/UpdateSocialAccountRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSocialAccountWriteRepository } from '../../../../infrastructure/repositories/ApiSocialAccountWriteRepository'

export class UpdateSocialAccountCommand {
    constructor(private readonly repo: ISocialAccountWriteRepository) {}

    static create(): UpdateSocialAccountCommand {
        const client = new HttpApiClient()
        const repo   = new ApiSocialAccountWriteRepository(client)
        return new UpdateSocialAccountCommand(repo)
    }

    async execute(id: number, input: UpdateSocialAccountRequestDTO, accessToken: string): Promise<SocialAccount> {
        return this.repo.update(id, input, accessToken)
    }
}
