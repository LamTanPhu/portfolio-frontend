import type { IContactWriteRepository } from '../../../../domain/repositories/contact/IContactWriteRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiContactRepository } from '../../../../infrastructure/repositories/ApiContactRepository'

export class DeleteContactMessageCommand {
    constructor(private readonly repo: IContactWriteRepository) {}

    static create(): DeleteContactMessageCommand {
        const client = new HttpApiClient()
        const repo   = new ApiContactRepository(client)
        return new DeleteContactMessageCommand(repo)
    }

    async execute(id: number, accessToken: string): Promise<void> {
        await this.repo.delete(id, accessToken)
    }
}
