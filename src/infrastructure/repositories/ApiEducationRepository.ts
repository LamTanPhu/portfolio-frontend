import type { IEducationReadRepository } from '../../domain/repositories/education/IEducationReadRepository'
import type { Education }    from '../../domain/entities/Education'
import { EducationMapper }   from '../mappers/EducationMapper'
import type { EducationDTO } from '../../application/dtos/EducationDTO'
import type { IApiClient }   from '../../application/ports/IApiClient'

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