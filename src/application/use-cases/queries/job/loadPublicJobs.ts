import { createServerApiClient } from '../../../../infrastructure/api/createServerApiClient'
import { ApiJobRepository } from '../../../../infrastructure/repositories/ApiJobRepository'
import type { JobDTO } from '../../../dtos/job/JobDTO'
import { GetJobsQuery } from './GetJobsQuery'

// =============================================================================
// loadPublicJobs
// Server-only loader for the PUBLIC pages — same as loadJobs, but reads fall
// back to data/api-snapshot.json when the backend is down (see SNAPSHOT.md).
// Admin screens keep using loadJobs: they must show live data or an error.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadPublicJobs(): Promise<JobDTO[]> {
    const client = createServerApiClient()
    const repo   = new ApiJobRepository(client)
    const query  = new GetJobsQuery(repo)
    return query.execute()
}