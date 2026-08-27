import type { Job } from '../../domain/entities/Job'
import type { IJobWriteRepository } from '../../domain/repositories/job/IJobWriteRepository'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { CreateJobRequestDTO } from '../../application/dtos/job/CreateJobRequestDTO'
import type { UpdateJobRequestDTO } from '../../application/dtos/job/UpdateJobRequestDTO'
import type { JobDTO } from '../../application/dtos/job/JobDTO'
import { JobMapper } from '../mappers/JobMapper'

// =============================================================================
// ApiJobWriteRepository
// create — POST   /jobs
// update — PATCH  /jobs/:id
// delete — DELETE /jobs/:id
// =============================================================================
export class ApiJobWriteRepository implements IJobWriteRepository {
    constructor(private readonly client: IApiClient) {}

    async create(input: CreateJobRequestDTO, accessToken: string): Promise<Job> {
        const dto = await this.client.post<JobDTO>('/jobs', input, { accessToken })
        return JobMapper.toDomain(dto)
    }

    async update(id: number, input: UpdateJobRequestDTO, accessToken: string): Promise<Job> {
        const dto = await this.client.patch<JobDTO>(`/jobs/${id}`, input, { accessToken })
        return JobMapper.toDomain(dto)
    }

    async delete(id: number, accessToken: string): Promise<void> {
        await this.client.delete<void>(`/jobs/${id}`, { accessToken })
    }
}
