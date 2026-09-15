import type { SkillDTO } from '../../application/dtos/skill/SkillDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import { Skill } from '../../domain/entities/Skill'
import type { ISkillReadRepository } from '../../domain/repositories/skill/ISkillReadRepository'
import { SkillMapper } from '../mappers/SkillMapper'

// =============================================================================
// ApiSkillAdminRepository
// Implements ISkillReadRepository against the standalone GET /skills route
// (same controller as ApiSkillWriteRepository's POST/PATCH/DELETE) rather
// than the /about/skills aggregator ApiSkillRepository uses. Same data —
// the backend has no separate "everything including private" admin route
// for skills — but keeps admin reads colocated with admin writes on their
// own resource controller, instead of depending on a controller meant for
// the public About page. Used only by admin list/edit pages.
// =============================================================================
export class ApiSkillAdminRepository implements ISkillReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findPublished(): Promise<Skill[]> {
        const dtos = await this.client.get<SkillDTO[]>('/skills')
        return dtos.map(SkillMapper.toDomain)
    }
}
