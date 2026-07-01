import { HttpApiClient }    from '../../../../infrastructure/api/HttpApiClient'
import { ApiJobRepository } from '../../../../infrastructure/repositories/ApiJobRepository'
import type { JobDTO }      from '../../../dtos/JobDTO'
import { GetJobsQuery } from './GetJobsQuery'

// =============================================================================
// loadJobs
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadJobs(): Promise<JobDTO[]> {
    const client = new HttpApiClient()
    const repo   = new ApiJobRepository(client)
    const query  = new GetJobsQuery(repo)
    return query.execute()
}