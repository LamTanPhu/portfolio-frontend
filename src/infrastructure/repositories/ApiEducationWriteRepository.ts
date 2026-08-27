import type { Education } from '../../domain/entities/Education'
import type { IEducationWriteRepository } from '../../domain/repositories/education/IEducationWriteRepository'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { CreateEducationRequestDTO } from '../../application/dtos/education/CreateEducationRequestDTO'
import type { UpdateEducationRequestDTO } from '../../application/dtos/education/UpdateEducationRequestDTO'
import type { EducationDTO } from '../../application/dtos/education/EducationDTO'
import { EducationMapper } from '../mappers/EducationMapper'

// =============================================================================
// ApiEducationWriteRepository
// create — POST   /education
// update — PATCH  /education/:id
// delete — DELETE /education/:id
// =============================================================================
export class ApiEducationWriteRepository implements IEducationWriteRepository {
    constructor(private readonly client: IApiClient) {}

    async create(input: CreateEducationRequestDTO, accessToken: string): Promise<Education> {
        const dto = await this.client.post<EducationDTO>('/education', input, { accessToken })
        return EducationMapper.toDomain(dto)
    }

    async update(id: number, input: UpdateEducationRequestDTO, accessToken: string): Promise<Education> {
        const dto = await this.client.patch<EducationDTO>(`/education/${id}`, input, { accessToken })
        return EducationMapper.toDomain(dto)
    }

    async delete(id: number, accessToken: string): Promise<void> {
        await this.client.delete<void>(`/education/${id}`, { accessToken })
    }
}
