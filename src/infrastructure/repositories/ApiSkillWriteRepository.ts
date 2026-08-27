import type { Skill } from '../../domain/entities/Skill'
import type { ISkillWriteRepository } from '../../domain/repositories/skill/ISkillWriteRepository'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { CreateSkillRequestDTO, UpdateSkillRequestDTO, SkillDTO } from '../../application/dtos/skill/SkillDTO'
import { SkillMapper } from '../mappers/SkillMapper'

// =============================================================================
// ApiSkillWriteRepository
// create — POST   /skills
// update — PATCH  /skills/:id
// delete — DELETE /skills/:id
// =============================================================================
export class ApiSkillWriteRepository implements ISkillWriteRepository {
    constructor(private readonly client: IApiClient) {}

    async create(input: CreateSkillRequestDTO, accessToken: string): Promise<Skill> {
        const dto = await this.client.post<SkillDTO>('/skills', input, { accessToken })
        return SkillMapper.toDomain(dto)
    }

    async update(id: number, input: UpdateSkillRequestDTO, accessToken: string): Promise<Skill> {
        const dto = await this.client.patch<SkillDTO>(`/skills/${id}`, input, { accessToken })
        return SkillMapper.toDomain(dto)
    }

    async delete(id: number, accessToken: string): Promise<void> {
        await this.client.delete<void>(`/skills/${id}`, { accessToken })
    }
}
