import type { IProjectReadRepository } from '../../../../domain/repositories/project/IProjectReadRepository'
import type { ProjectDTO } from '../../../dtos/project/ProjectDTO'

// =============================================================================
// GetPublishedProjectsQuery
// Returns all published projects for public display.
// =============================================================================
export class GetPublishedProjectsQuery {
  constructor(private readonly repo: IProjectReadRepository) {}

  async execute(): Promise<ProjectDTO[]> {
    const projects = await this.repo.findPublished()
    return projects.map((p) => ({
      id:           p.id,
      name:         p.name,
      description:  p.description,
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
