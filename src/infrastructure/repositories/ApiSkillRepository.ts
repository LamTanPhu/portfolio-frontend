import type { ISkillReadRepository } from '../../domain/repositories/skill/ISkillReadRepository'
import { Skill }        from '../../domain/entities/Skill'
import { SkillMapper }  from '../mappers/SkillMapper'
import type { SkillDTO } from '../../application/dtos/SkillDTO'
import { get }          from '../api/httpClient'

// =============================================================================
// ApiSkillRepository
// Implements ISkillReadRepository using the backend REST API.
// =============================================================================
export class ApiSkillRepository implements ISkillReadRepository {
    async findPublished(): Promise<Skill[]> {
        const dtos = await get<SkillDTO[]>('/about/skills')
        return dtos.map(SkillMapper.toDomain)
    }
}