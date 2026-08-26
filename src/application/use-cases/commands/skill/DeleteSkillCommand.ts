import type { ISkillWriteRepository } from '../../../../domain/repositories/skill/ISkillWriteRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSkillWriteRepository } from '../../../../infrastructure/repositories/ApiSkillWriteRepository'

export class DeleteSkillCommand {
    constructor(private readonly repo: ISkillWriteRepository) {}

    static create(): DeleteSkillCommand {
        const client = new HttpApiClient()
        const repo   = new ApiSkillWriteRepository(client)
        return new DeleteSkillCommand(repo)
    }

    async execute(id: number, accessToken: string): Promise<void> {
        await this.repo.delete(id, accessToken)
    }
}
