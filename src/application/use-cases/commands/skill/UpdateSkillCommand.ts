import type { Skill } from '../../../../domain/entities/Skill'
import type { ISkillWriteRepository } from '../../../../domain/repositories/skill/ISkillWriteRepository'
import type { UpdateSkillRequestDTO } from '../../../dtos/skill/SkillDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSkillWriteRepository } from '../../../../infrastructure/repositories/ApiSkillWriteRepository'

export class UpdateSkillCommand {
    constructor(private readonly repo: ISkillWriteRepository) {}

    static create(): UpdateSkillCommand {
        const client = new HttpApiClient()
        const repo   = new ApiSkillWriteRepository(client)
        return new UpdateSkillCommand(repo)
    }

    async execute(id: number, input: UpdateSkillRequestDTO, accessToken: string): Promise<Skill> {
        return this.repo.update(id, input, accessToken)
    }
}
