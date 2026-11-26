import type { IProjectReadRepository } from '../../../../domain/repositories/project/IProjectReadRepository'
import type { ProjectDTO }             from '../../../dtos/project/ProjectDTO'
import { HttpApiClient }               from '../../../../infrastructure/api/HttpApiClient'
import { ApiProjectRepository }        from '../../../../infrastructure/repositories/ApiProjectRepository'

// =============================================================================
// GetProjectForAdminQuery
// Admin-only — ONE project by slug, draft or published
// (GET /projects/admin/:slug). The public GET /projects/:slug answers 404 for
// drafts, so the edit form cannot use it. Client-callable since it needs the
// access token held in AuthContext. Returns null on a genuine 404.
// =============================================================================
export class GetProjectForAdminQuery {
  constructor(private readonly repo: IProjectReadRepository) {}

  static create(): GetProjectForAdminQuery {
    const client = new HttpApiClient()
    const repo   = new ApiProjectRepository(client)
    return new GetProjectForAdminQuery(repo)
  }

  async execute(slug: string, accessToken: string): Promise<ProjectDTO | null> {
    const project = await this.repo.findBySlugAdmin(slug, accessToken)
    if (!project) return null

    return {
      id:           project.id,
      name:         project.name,
      description:  project.description,
      slug:         project.slug,
      techStack:    project.techStack,
      repoUrl:      project.repoUrl,
      liveUrl:      project.liveUrl,
      thumbnailUrl: project.thumbnailUrl,
      isPublished:  project.isPublished,
      isOpenSource: project.isOpenSource,
      createdAt:    project.createdAt.toISOString(),
      updatedAt:    project.updatedAt.toISOString(),
    }
  }
}
