import type { IEducationWriteRepository } from '../../../../domain/repositories/education/IEducationWriteRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiEducationWriteRepository } from '../../../../infrastructure/repositories/ApiEducationWriteRepository'

export class DeleteEducationCommand {
    constructor(private readonly repo: IEducationWriteRepository) {}

    static create(): DeleteEducationCommand {
        const client = new HttpApiClient()
        const repo   = new ApiEducationWriteRepository(client)
        return new DeleteEducationCommand(repo)
    }

    async execute(id: number, accessToken: string): Promise<void> {
        await this.repo.delete(id, accessToken)
    }
}
