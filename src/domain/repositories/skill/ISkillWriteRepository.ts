import type { Skill } from '../../entities/Skill'
import type { CreateSkillRequestDTO, UpdateSkillRequestDTO } from '../../../application/dtos/skill/SkillDTO'

// =============================================================================
// ISkillWriteRepository
// Admin-only — every method requires a valid access token.
// =============================================================================
export interface ISkillWriteRepository {
    create(input: CreateSkillRequestDTO, accessToken: string): Promise<Skill>
    update(id: number, input: UpdateSkillRequestDTO, accessToken: string): Promise<Skill>
    delete(id: number, accessToken: string): Promise<void>
}
