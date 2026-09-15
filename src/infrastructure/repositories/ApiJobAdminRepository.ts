import type { JobDTO } from '../../application/dtos/job/JobDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { Job } from '../../domain/entities/Job'
import type { IJobReadRepository } from '../../domain/repositories/job/IJobReadRepository'
import { JobMapper } from '../mappers/JobMapper'

// =============================================================================
// ApiJobAdminRepository
// Implements IJobReadRepository against the standalone GET /jobs route (same
// controller as the admin POST/PATCH/DELETE) rather than the /about/jobs
// aggregator ApiJobRepository uses. Same data — the backend has no separate
// "everything including private" admin route for jobs — but keeps admin
// reads colocated with admin writes on their own resource controller.
// Used only by admin list/edit pages.
// =============================================================================
export class ApiJobAdminRepository implements IJobReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findAll(): Promise<Job[]> {
        const dtos = await this.client.get<JobDTO[]>('/jobs')
        return dtos.map(JobMapper.toDomain)
    }
}
