import type { IProjectReadRepository } from '../../../../domain/repositories/project/IProjectReadRepository'
import type { ProjectSummaryDTO }      from '../../../dtos/project/ProjectSummaryDTO'
import { HttpApiClient }               from '../../../../infrastructure/api/HttpApiClient'
import { ApiProjectRepository }        from '../../../../infrastructure/repositories/ApiProjectRepository'

// =============================================================================
// GetAllProjectsQuery
// Admin-only — every project including drafts (GET /projects/admin).
// Client-callable (not a server loader like loadProjects.ts) since it needs the
// access token held in AuthContext, passed in at execute-time. Mirrors
// GetAllBlogsQuery.
// =============================================================================
export class GetAllProjectsQuery {
  constructor(private readonly repo: IProjectReadRepository) {}

  static create(): GetAllProjectsQuery {
    const client = new HttpApiClient()
    const repo   = new ApiProjectRepository(client)
    return new GetAllProjectsQuery(repo)
  }

  async execute(accessToken: string): Promise<ProjectSummaryDTO[]> {
    const projects = await this.repo.findAllAdmin(accessToken)
    return projects.map((p) => ({
      id:           p.id,
      name:         p.name,
      slug:         p.slug,
      techStack:    p.techStack,
      repoUrl:      p.repoUrl,
      liveUrl:      p.liveUrl,
      thumbnailUrl: p.thumbnailUrl,
      isPublished:  p.isPublished,
      isOpenSource: p.isOpenSource,
      createdAt:    p.createdAt.toISOString(),
      updatedAt:    p.updatedAt.toISOString(),
    }))
  }
}
