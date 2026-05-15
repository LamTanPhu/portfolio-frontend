import type { IProjectReadRepository } from '../../domain/repositories/project/IProjectReadRepository'
import { Project } from '../../domain/entities/Project'
import { ProjectMapper } from '../mappers/ProjectMapper'
import type { ProjectDTO } from '../../application/dtos/ProjectDTO'
import { get } from '../api/httpClient'

// =============================================================================
// ApiProjectRepository
// Implements IProjectReadRepository using the backend REST API.
// =============================================================================
export class ApiProjectRepository implements IProjectReadRepository {
  async findPublished(): Promise<Project[]> {
    const dtos = await get<ProjectDTO[]>('/projects')
    return dtos.map(ProjectMapper.toDomain)
  }

  async findBySlug(slug: string): Promise<Project | null> {
    try {
      const dto = await get<ProjectDTO>(`/projects/${slug}`)
      return ProjectMapper.toDomain(dto)
    } catch {
      return null
    }
  }
}
