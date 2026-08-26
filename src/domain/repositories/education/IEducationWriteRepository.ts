import type { Education } from '../../entities/Education'
import type { CreateEducationRequestDTO } from '../../../application/dtos/education/CreateEducationRequestDTO'
import type { UpdateEducationRequestDTO } from '../../../application/dtos/education/UpdateEducationRequestDTO'

// =============================================================================
// IEducationWriteRepository
// Admin-only — every method requires a valid access token.
// =============================================================================
export interface IEducationWriteRepository {
    create(input: CreateEducationRequestDTO, accessToken: string): Promise<Education>
    update(id: number, input: UpdateEducationRequestDTO, accessToken: string): Promise<Education>
    delete(id: number, accessToken: string): Promise<void>
}
