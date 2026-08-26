import type { IJobWriteRepository } from '../../../../domain/repositories/job/IJobWriteRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiJobWriteRepository } from '../../../../infrastructure/repositories/ApiJobWriteRepository'

export class DeleteJobCommand {
    constructor(private readonly repo: IJobWriteRepository) {}

    static create(): DeleteJobCommand {
        const client = new HttpApiClient()
        const repo   = new ApiJobWriteRepository(client)
        return new DeleteJobCommand(repo)
    }

    async execute(id: number, accessToken: string): Promise<void> {
        await this.repo.delete(id, accessToken)
    }
}
