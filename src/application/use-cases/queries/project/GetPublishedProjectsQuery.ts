import type { IProjectReadRepository } from '../../../../domain/repositories/project/IProjectReadRepository'
import type { ProjectSummaryDTO } from '../../../dtos/project/ProjectSummaryDTO'

// =============================================================================
// GetPublishedProjectsQuery
// Returns published project summaries for list view (no description — use
// GetProjectBySlugQuery for the full single-item view).
// =============================================================================
export class GetPublishedProjectsQuery {
  constructor(private readonly repo: IProjectReadRepository) {}

  async execute(): Promise<ProjectSummaryDTO[]> {
    const projects = await this.repo.findPublished()
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
