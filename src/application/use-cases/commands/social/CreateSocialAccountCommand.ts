import type { SocialAccount } from '../../../../domain/entities/SocialAccount'
import type { ISocialAccountWriteRepository } from '../../../../domain/repositories/social/ISocialAccountWriteRepository'
import type { CreateSocialAccountRequestDTO } from '../../../dtos/socialAccount/CreateSocialAccountRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSocialAccountWriteRepository } from '../../../../infrastructure/repositories/ApiSocialAccountWriteRepository'

export class CreateSocialAccountCommand {
    constructor(private readonly repo: ISocialAccountWriteRepository) {}

    static create(): CreateSocialAccountCommand {
        const client = new HttpApiClient()
        const repo   = new ApiSocialAccountWriteRepository(client)
        return new CreateSocialAccountCommand(repo)
    }

    async execute(input: CreateSocialAccountRequestDTO, accessToken: string): Promise<SocialAccount> {
        return this.repo.create(input, accessToken)
    }
}
