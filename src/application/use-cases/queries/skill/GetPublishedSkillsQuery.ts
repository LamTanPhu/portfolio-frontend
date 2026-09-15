import type { ISkillReadRepository } from '../../../../domain/repositories/skill/ISkillReadRepository'
import type { SkillDTO } from '../../../dtos/skill/SkillDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSkillAdminRepository } from '../../../../infrastructure/repositories/ApiSkillAdminRepository'

// =============================================================================
// GetPublishedSkillsQuery
// Returns all public skills grouped by category.
//
// Two valid compositions of the same query, same data, different route:
// loadSkills.ts wires the default (public, /about/skills) for Server
// Components. createForAdmin() wires the standalone /skills route instead,
// for admin list/edit pages — colocated with ApiSkillWriteRepository's
// writes on the same controller. Client-callable, matching the static
// create() pattern used by TrackResumeDownloadCommand/GetPageViewsQuery.
// =============================================================================
export class GetPublishedSkillsQuery {
  constructor(private readonly repo: ISkillReadRepository) {}

  static createForAdmin(): GetPublishedSkillsQuery {
    const client = new HttpApiClient()
    const repo   = new ApiSkillAdminRepository(client)
    return new GetPublishedSkillsQuery(repo)
  }

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
