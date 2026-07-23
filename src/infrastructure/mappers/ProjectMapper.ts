import type { ProjectDTO } from '../../application/dtos/project/ProjectDTO'
import { Project } from '../../domain/entities/Project'

// =============================================================================
// ProjectMapper
// Converts raw API response → domain entity.
// =============================================================================
export class ProjectMapper {
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
