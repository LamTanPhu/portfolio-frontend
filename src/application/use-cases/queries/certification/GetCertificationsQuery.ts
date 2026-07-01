import type { ICertificationReadRepository } from '../../../../domain/repositories/certification/ICertificationReadRepository'
import type { CertificationDTO } from '../../../dtos/CertificationDTO'

// =============================================================================
// GetCertificationsQuery
// Returns all certification records for the About page.
// =============================================================================
export class GetCertificationsQuery {
    constructor(private readonly repo: ICertificationReadRepository) {}

    async execute(): Promise<CertificationDTO[]> {
        const certifications = await this.repo.findAll()
        return certifications.map((c) => ({
            id:        c.id,
            name:      c.name,
            url:       c.url,
            startDate: c.startDate.toISOString(),
            endDate:   c.endDate?.toISOString() ?? null,
        }))
    }
}