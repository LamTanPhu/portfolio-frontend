import type { ICertificationReadRepository } from '../../domain/repositories/certification/ICertificationReadRepository'
import type { Certification }    from '../../domain/entities/Certification'
import { CertificationMapper }   from '../mappers/CertificationMapper'
import type { CertificationDTO } from '../../application/dtos/CertificationDTO'
import type { IApiClient }       from '../../application/ports/IApiClient'

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