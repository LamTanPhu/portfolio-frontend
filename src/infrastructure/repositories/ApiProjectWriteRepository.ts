import type { Project } from '../../domain/entities/Project'
import type { IProjectWriteRepository } from '../../domain/repositories/project/IProjectWriteRepository'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { CreateProjectRequestDTO, UpdateProjectRequestDTO } from '../../application/dtos/project/ProjectRequestDTO'
import type { ProjectDTO } from '../../application/dtos/project/ProjectDTO'
import { ProjectMapper } from '../mappers/ProjectMapper'

// =============================================================================
// ApiProjectWriteRepository
// create — POST   /projects
// update — PATCH  /projects/:id
// delete — DELETE /projects/:id
// create/update return the full ProjectDTO (with description) — the same
// shape ProjectPresenter.toResponse sends on the backend.
// =============================================================================
export class ApiProjectWriteRepository implements IProjectWriteRepository {
    constructor(private readonly client: IApiClient) {}

    async create(input: CreateProjectRequestDTO, accessToken: string): Promise<Project> {
        const dto = await this.client.post<ProjectDTO>('/projects', input, { accessToken })
        return ProjectMapper.toDomain(dto)
    }

    async update(id: number, input: UpdateProjectRequestDTO, accessToken: string): Promise<Project> {
        const dto = await this.client.patch<ProjectDTO>(`/projects/${id}`, input, { accessToken })
        return ProjectMapper.toDomain(dto)
    }

    async delete(id: number, accessToken: string): Promise<void> {
        await this.client.delete<void>(`/projects/${id}`, { accessToken })
    }
}
