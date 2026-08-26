import type { IProjectWriteRepository } from '../../../../domain/repositories/project/IProjectWriteRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiProjectWriteRepository } from '../../../../infrastructure/repositories/ApiProjectWriteRepository'

export class DeleteProjectCommand {
    constructor(private readonly repo: IProjectWriteRepository) {}

    static create(): DeleteProjectCommand {
        const client = new HttpApiClient()
        const repo   = new ApiProjectWriteRepository(client)
        return new DeleteProjectCommand(repo)
    }

    async execute(id: number, accessToken: string): Promise<void> {
        await this.repo.delete(id, accessToken)
    }
}
