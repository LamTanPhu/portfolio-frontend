import type { SkillDTO } from '../../application/dtos/SkillDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import { Skill } from '../../domain/entities/Skill'
import type { ISkillReadRepository } from '../../domain/repositories/skill/ISkillReadRepository'
import { SkillMapper } from '../mappers/SkillMapper'

// =============================================================================
// ApiSkillRepository
// Implements ISkillReadRepository using the backend REST API.
// =============================================================================
export class ApiSkillRepository implements ISkillReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findPublished(): Promise<Skill[]> {
        const dtos = await this.client.get<SkillDTO[]>('/about/skills')
        return dtos.map(SkillMapper.toDomain)
    }
}