import type { Certification } from '../../domain/entities/Certification'
import type { ICertificationWriteRepository } from '../../domain/repositories/certification/ICertificationWriteRepository'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { CreateCertificationRequestDTO } from '../../application/dtos/certification/CreateCertificationRequestDTO'
import type { UpdateCertificationRequestDTO } from '../../application/dtos/certification/UpdateCertificationRequestDTO'
import type { CertificationDTO } from '../../application/dtos/certification/CertificationDTO'
import { CertificationMapper } from '../mappers/CertificationMapper'

// =============================================================================
// ApiCertificationWriteRepository
// create — POST   /certifications
// update — PATCH  /certifications/:id
// delete — DELETE /certifications/:id
// =============================================================================
export class ApiCertificationWriteRepository implements ICertificationWriteRepository {
    constructor(private readonly client: IApiClient) {}

    async create(input: CreateCertificationRequestDTO, accessToken: string): Promise<Certification> {
        const dto = await this.client.post<CertificationDTO>('/certifications', input, { accessToken })
        return CertificationMapper.toDomain(dto)
    }

    async update(id: number, input: UpdateCertificationRequestDTO, accessToken: string): Promise<Certification> {
        const dto = await this.client.patch<CertificationDTO>(`/certifications/${id}`, input, { accessToken })
        return CertificationMapper.toDomain(dto)
    }

    async delete(id: number, accessToken: string): Promise<void> {
        await this.client.delete<void>(`/certifications/${id}`, { accessToken })
    }
}
