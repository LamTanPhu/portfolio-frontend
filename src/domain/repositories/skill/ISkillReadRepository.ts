import type { Skill } from '../../entities/Skill'
export interface ISkillReadRepository {
  findPublished(): Promise<Skill[]>
}