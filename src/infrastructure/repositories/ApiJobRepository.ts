import type { JobDTO } from '../../application/dtos/job/JobDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { Job } from '../../domain/entities/Job'
import type { IJobReadRepository } from '../../domain/repositories/job/IJobReadRepository'
import { JobMapper } from '../mappers/JobMapper'

// =============================================================================
// ApiJobRepository
// findAll — GET /about/jobs → JobDTO[] → Job[]
// =============================================================================
export class ApiJobRepository implements IJobReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findAll(): Promise<Job[]> {
        const dtos = await this.client.get<JobDTO[]>('/about/jobs')
        return dtos.map(JobMapper.toDomain)
    }
}