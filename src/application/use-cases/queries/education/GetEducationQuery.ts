import type { IEducationReadRepository } from '../../../../domain/repositories/education/IEducationReadRepository'
import type { EducationDTO } from '../../../dtos/education/EducationDTO'

// =============================================================================
// GetEducationQuery
// Returns all education records for the About page.
// =============================================================================
export class GetEducationQuery {
    constructor(private readonly repo: IEducationReadRepository) {}

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