import type { CertificationDTO } from '../../application/dtos/certification/CertificationDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { Certification } from '../../domain/entities/Certification'
import type { ICertificationReadRepository } from '../../domain/repositories/certification/ICertificationReadRepository'
import { CertificationMapper } from '../mappers/CertificationMapper'

// =============================================================================
// ApiCertificationAdminRepository
// Implements ICertificationReadRepository against the standalone
// GET /certifications route (same controller as the admin POST/PATCH/DELETE)
// rather than the /about/certifications aggregator ApiCertificationRepository
// uses. Same data — the backend has no separate "everything including
// private" admin route for certifications — but keeps admin reads colocated
// with admin writes on their own resource controller. Used only by admin
// list/edit pages.
// =============================================================================
export class ApiCertificationAdminRepository implements ICertificationReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findAll(): Promise<Certification[]> {
        const dtos = await this.client.get<CertificationDTO[]>('/certifications')
        return dtos.map(CertificationMapper.toDomain)
    }
}
