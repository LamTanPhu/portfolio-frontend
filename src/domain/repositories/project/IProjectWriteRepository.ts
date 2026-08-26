import type { Project } from '../../entities/Project'
import type { CreateProjectRequestDTO, UpdateProjectRequestDTO } from '../../../application/dtos/project/ProjectRequestDTO'

// =============================================================================
// IProjectWriteRepository
// Admin-only — every method requires a valid access token.
// =============================================================================
export interface IProjectWriteRepository {
    create(input: CreateProjectRequestDTO, accessToken: string): Promise<Project>
    update(id: number, input: UpdateProjectRequestDTO, accessToken: string): Promise<Project>
    delete(id: number, accessToken: string): Promise<void>
}
