import type { IJobReadRepository } from '../../domain/repositories/job/IJobReadRepository'
import type { Job }          from '../../domain/entities/Job'
import { JobMapper }         from '../mappers/JobMapper'
import type { JobDTO }       from '../../application/dtos/JobDTO'
import type { IApiClient }   from '../../application/ports/IApiClient'

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