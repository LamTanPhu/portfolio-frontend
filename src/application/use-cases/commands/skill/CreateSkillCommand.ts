import type { Skill } from '../../../../domain/entities/Skill'
import type { ISkillWriteRepository } from '../../../../domain/repositories/skill/ISkillWriteRepository'
import type { CreateSkillRequestDTO } from '../../../dtos/skill/SkillDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSkillWriteRepository } from '../../../../infrastructure/repositories/ApiSkillWriteRepository'

export class CreateSkillCommand {
    constructor(private readonly repo: ISkillWriteRepository) {}

    static create(): CreateSkillCommand {
        const client = new HttpApiClient()
        const repo   = new ApiSkillWriteRepository(client)
        return new CreateSkillCommand(repo)
    }

    async execute(input: CreateSkillRequestDTO, accessToken: string): Promise<Skill> {
        return this.repo.create(input, accessToken)
    }
}
