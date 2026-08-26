import type { ISocialAccountWriteRepository } from '../../../../domain/repositories/social/ISocialAccountWriteRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSocialAccountWriteRepository } from '../../../../infrastructure/repositories/ApiSocialAccountWriteRepository'

export class DeleteSocialAccountCommand {
    constructor(private readonly repo: ISocialAccountWriteRepository) {}

    static create(): DeleteSocialAccountCommand {
        const client = new HttpApiClient()
        const repo   = new ApiSocialAccountWriteRepository(client)
        return new DeleteSocialAccountCommand(repo)
    }

    async execute(id: number, accessToken: string): Promise<void> {
        await this.repo.delete(id, accessToken)
    }
}
