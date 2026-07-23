import type { ProjectDTO } from '../../application/dtos/project/ProjectDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import { Project } from '../../domain/entities/Project'
import type { IProjectReadRepository } from '../../domain/repositories/project/IProjectReadRepository'
import { ApiError } from '../api/httpClient'
import { ProjectMapper } from '../mappers/ProjectMapper'

// =============================================================================
// ApiProjectRepository
// Implements IProjectReadRepository using the backend REST API.
//
// findBySlug only treats a genuine 404 as "not found" (returns null). Any
// other failure (network error, 500, etc.) rethrows — a real outage must
// never be silently presented to the user as "this project doesn't exist."
// =============================================================================
export class ApiProjectRepository implements IProjectReadRepository {
  constructor(private readonly client: IApiClient) {}

  async findPublished(): Promise<Project[]> {
    const dtos = await this.client.get<ProjectDTO[]>('/projects')
    return dtos.map(ProjectMapper.toDomain)
  }

  async findBySlug(slug: string): Promise<Project | null> {
    try {
      const dto = await this.client.get<ProjectDTO>(`/projects/${slug}`)
      return ProjectMapper.toDomain(dto)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  }
}