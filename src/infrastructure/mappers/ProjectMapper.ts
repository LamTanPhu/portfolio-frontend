import type { ProjectDTO } from '../../application/dtos/project/ProjectDTO'
import type { ProjectSummaryDTO } from '../../application/dtos/project/ProjectSummaryDTO'
import { Project, ProjectSummary } from '../../domain/entities/Project'

// =============================================================================
// ProjectMapper
// toDomainSummary — ProjectSummaryDTO → ProjectSummary (list view, no description)
// toDomain        — ProjectDTO        → Project        (detail view, full body)
// =============================================================================
export class ProjectMapper {
  static toDomainSummary(dto: ProjectSummaryDTO): ProjectSummary {
    return new ProjectSummary(
      dto.id,
      dto.name,
      dto.slug,
      dto.techStack,
      dto.repoUrl,
      dto.liveUrl,
      dto.thumbnailUrl,
      dto.isPublished,
      dto.isOpenSource,
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
    )
  }

  static toDomain(dto: ProjectDTO): Project {
    return new Project(
      dto.id,
      dto.name,
      dto.description,
      dto.slug,
      dto.techStack,
      dto.repoUrl,
      dto.liveUrl,
      dto.thumbnailUrl,
      dto.isPublished,
      dto.isOpenSource,
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
    )
  }
}
