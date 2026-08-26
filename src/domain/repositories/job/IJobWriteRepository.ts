import type { Job } from '../../entities/Job'
import type { CreateJobRequestDTO } from '../../../application/dtos/job/CreateJobRequestDTO'
import type { UpdateJobRequestDTO } from '../../../application/dtos/job/UpdateJobRequestDTO'

// =============================================================================
// IJobWriteRepository
// Admin-only — every method requires a valid access token.
// =============================================================================
export interface IJobWriteRepository {
    create(input: CreateJobRequestDTO, accessToken: string): Promise<Job>
    update(id: number, input: UpdateJobRequestDTO, accessToken: string): Promise<Job>
    delete(id: number, accessToken: string): Promise<void>
}
