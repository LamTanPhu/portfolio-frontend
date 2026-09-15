import type { IEducationReadRepository } from '../../../../domain/repositories/education/IEducationReadRepository'
import type { EducationDTO } from '../../../dtos/education/EducationDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiEducationAdminRepository } from '../../../../infrastructure/repositories/ApiEducationAdminRepository'

// =============================================================================
// GetEducationQuery
// Returns all education records for the About page.
//
// Two valid compositions of the same query, same data, different route —
// see GetPublishedSkillsQuery for the full rationale. loadEducation.ts
// wires the default (public, /about/education); createForAdmin() wires
// the standalone /education route for admin list/edit pages instead.
// =============================================================================
export class GetEducationQuery {
    constructor(private readonly repo: IEducationReadRepository) {}

    static createForAdmin(): GetEducationQuery {
        const client = new HttpApiClient()
        const repo   = new ApiEducationAdminRepository(client)
        return new GetEducationQuery(repo)
    }

    async execute(): Promise<EducationDTO[]> {
        const records = await this.repo.findAll()
        return records.map((e) => ({
            id:            e.id,
            degreeName:    e.degreeName,
            instituteName: e.instituteName,
            instituteUrl:  e.instituteUrl,
            startedAt:     e.startedAt.toISOString(),
            endedAt:       e.endedAt?.toISOString() ?? null,
            isCompleted:   e.isCompleted,
        }))
    }
}