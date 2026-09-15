import type { IJobReadRepository } from '../../../../domain/repositories/job/IJobReadRepository'
import type { JobDTO } from '../../../dtos/job/JobDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiJobAdminRepository } from '../../../../infrastructure/repositories/ApiJobAdminRepository'

// =============================================================================
// GetJobsQuery
// Returns all work experience records for the About page.
//
// Two valid compositions of the same query, same data, different route —
// see GetPublishedSkillsQuery for the full rationale. loadJobs.ts wires
// the default (public, /about/jobs); createForAdmin() wires the standalone
// /jobs route for admin list/edit pages instead.
// =============================================================================
export class GetJobsQuery {
    constructor(private readonly repo: IJobReadRepository) {}

    static createForAdmin(): GetJobsQuery {
        const client = new HttpApiClient()
        const repo   = new ApiJobAdminRepository(client)
        return new GetJobsQuery(repo)
    }

    async execute(): Promise<JobDTO[]> {
        const jobs = await this.repo.findAll()
        return jobs.map((j) => ({
            id:          j.id,
            companyName: j.companyName,
            role:        j.role,
            startedAt:   j.startedAt.toISOString(),
            endedAt:     j.endedAt?.toISOString() ?? null,
            isEnded:     j.isEnded,
        }))
    }
}