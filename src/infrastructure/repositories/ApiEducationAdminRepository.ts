import type { EducationDTO } from '../../application/dtos/education/EducationDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { Education } from '../../domain/entities/Education'
import type { IEducationReadRepository } from '../../domain/repositories/education/IEducationReadRepository'
import { EducationMapper } from '../mappers/EducationMapper'

// =============================================================================
// ApiEducationAdminRepository
// Implements IEducationReadRepository against the standalone GET /education
// route (same controller as the admin POST/PATCH/DELETE) rather than the
// /about/education aggregator ApiEducationRepository uses. Same data — the
// backend has no separate "everything including private" admin route for
// education — but keeps admin reads colocated with admin writes on their
// own resource controller. Used only by admin list/edit pages.
// =============================================================================
export class ApiEducationAdminRepository implements IEducationReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findAll(): Promise<Education[]> {
        const dtos = await this.client.get<EducationDTO[]>('/education')
        return dtos.map(EducationMapper.toDomain)
    }
}
