import type { IProjectReadRepository } from '../../../../domain/repositories/project/IProjectReadRepository'
import type { ProjectDTO } from '../../../dtos/ProjectDTO'

// =============================================================================
// GetProjectBySlugQuery
// Returns a single published project for detail view.
// Returns null if not found — mirrors GetBlogBySlugQuery's contract.
// =============================================================================
export class GetProjectBySlugQuery {
    constructor(private readonly repo: IProjectReadRepository) {}

    async execute(slug: string): Promise<ProjectDTO | null> {
        const project = await this.repo.findBySlug(slug)
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