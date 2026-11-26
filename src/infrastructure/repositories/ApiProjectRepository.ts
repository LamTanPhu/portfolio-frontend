import type { ProjectDTO } from '../../application/dtos/project/ProjectDTO'
import type { ProjectSummaryDTO } from '../../application/dtos/project/ProjectSummaryDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import { Project, ProjectSummary } from '../../domain/entities/Project'
import type { IProjectReadRepository } from '../../domain/repositories/project/IProjectReadRepository'
import { ApiError } from '../api/httpClient'
import { ProjectMapper } from '../mappers/ProjectMapper'

// =============================================================================
// ApiProjectRepository
// Implements IProjectReadRepository using the backend REST API.
//
// findPublished — GET /projects       → ProjectSummaryDTO[] → ProjectSummary[]
// findBySlug    — GET /projects/:slug → ProjectDTO           → Project
//                 (published projects only — a draft is a 404)
// findAllAdmin  — GET /projects/admin → every project incl. drafts (JWT)
// findBySlugAdmin — GET /projects/admin/:slug → one project incl. drafts (JWT)
//
// findBySlug only treats a genuine 404 as "not found" (returns null). Any
// other failure (network error, 500, etc.) rethrows — a real outage must
// never be silently presented to the user as "this project doesn't exist."
// =============================================================================
export class ApiProjectRepository implements IProjectReadRepository {
  constructor(private readonly client: IApiClient) {}

  async findPublished(): Promise<ProjectSummary[]> {
    const dtos = await this.client.get<ProjectSummaryDTO[]>('/projects')
    return dtos.map(ProjectMapper.toDomainSummary)
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

  async findAllAdmin(accessToken: string): Promise<ProjectSummary[]> {
    const dtos = await this.client.get<ProjectSummaryDTO[]>('/projects/admin', 0, { accessToken })
    return dtos.map(ProjectMapper.toDomainSummary)
  }

  // revalidate: 0 — an editor must never be handed a cached copy of the row they are about to overwrite.
  async findBySlugAdmin(slug: string, accessToken: string): Promise<Project | null> {
    try {
      const dto = await this.client.get<ProjectDTO>(`/projects/admin/${encodeURIComponent(slug)}`, 0, { accessToken })
      return ProjectMapper.toDomain(dto)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  }
}
