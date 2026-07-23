import type { ISkillReadRepository } from '../../../../domain/repositories/skill/ISkillReadRepository'
import type { SkillDTO } from '../../../dtos/skill/SkillDTO'

// =============================================================================
// GetPublishedSkillsQuery
// Returns all public skills grouped by category.
// =============================================================================
export class GetPublishedSkillsQuery {
  constructor(private readonly repo: ISkillReadRepository) {}

  async execute(): Promise<SkillDTO[]> {
    const skills = await this.repo.findPublished()
    return skills.map((s) => ({
      id:       s.id,
      name:     s.name,
      imageUrl: s.imageUrl,
      category: s.category,
    }))
  }
}
