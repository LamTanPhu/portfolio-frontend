import type { CertificationDTO } from '../../application/dtos/certification/CertificationDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { Certification } from '../../domain/entities/Certification'
import type { ICertificationReadRepository } from '../../domain/repositories/certification/ICertificationReadRepository'
import { CertificationMapper } from '../mappers/CertificationMapper'

// =============================================================================
// ApiCertificationRepository
// findAll — GET /about/certifications → CertificationDTO[] → Certification[]
// =============================================================================
export class ApiCertificationRepository implements ICertificationReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findAll(): Promise<Certification[]> {
        const dtos = await this.client.get<CertificationDTO[]>('/about/certifications')
        return dtos.map(CertificationMapper.toDomain)
    }
}