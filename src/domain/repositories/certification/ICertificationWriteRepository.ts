import type { Certification } from '../../entities/Certification'
import type { CreateCertificationRequestDTO } from '../../../application/dtos/certification/CreateCertificationRequestDTO'
import type { UpdateCertificationRequestDTO } from '../../../application/dtos/certification/UpdateCertificationRequestDTO'

// =============================================================================
// ICertificationWriteRepository
// Admin-only — every method requires a valid access token.
// =============================================================================
export interface ICertificationWriteRepository {
    create(input: CreateCertificationRequestDTO, accessToken: string): Promise<Certification>
    update(id: number, input: UpdateCertificationRequestDTO, accessToken: string): Promise<Certification>
    delete(id: number, accessToken: string): Promise<void>
}
