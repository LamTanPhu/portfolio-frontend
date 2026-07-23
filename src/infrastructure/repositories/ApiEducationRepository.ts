import type { EducationDTO } from '../../application/dtos/education/EducationDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { Education } from '../../domain/entities/Education'
import type { IEducationReadRepository } from '../../domain/repositories/education/IEducationReadRepository'
import { EducationMapper } from '../mappers/EducationMapper'

// =============================================================================
// ApiEducationRepository
// findAll — GET /about/education → EducationDTO[] → Education[]
// =============================================================================
export class ApiEducationRepository implements IEducationReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findAll(): Promise<Education[]> {
        const dtos = await this.client.get<EducationDTO[]>('/about/education')
        return dtos.map(EducationMapper.toDomain)
    }
}