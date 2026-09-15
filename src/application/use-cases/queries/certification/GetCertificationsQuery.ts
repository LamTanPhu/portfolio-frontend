import type { ICertificationReadRepository } from '../../../../domain/repositories/certification/ICertificationReadRepository'
import type { CertificationDTO } from '../../../dtos/certification/CertificationDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiCertificationAdminRepository } from '../../../../infrastructure/repositories/ApiCertificationAdminRepository'

// =============================================================================
// GetCertificationsQuery
// Returns all certification records for the About page.
//
// Two valid compositions of the same query, same data, different route —
// see GetPublishedSkillsQuery for the full rationale. loadCertification.ts
// wires the default (public, /about/certifications); createForAdmin() wires
// the standalone /certifications route for admin list/edit pages instead.
// =============================================================================
export class GetCertificationsQuery {
    constructor(private readonly repo: ICertificationReadRepository) {}

    static createForAdmin(): GetCertificationsQuery {
        const client = new HttpApiClient()
        const repo   = new ApiCertificationAdminRepository(client)
        return new GetCertificationsQuery(repo)
    }

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