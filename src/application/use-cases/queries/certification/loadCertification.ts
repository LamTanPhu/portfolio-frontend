import { ApiCertificationRepository } from '@/src/infrastructure/repositories/ApiCertificationRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import type { CertificationDTO } from '../../../dtos/certification/CertificationDTO'
import { GetCertificationsQuery } from './GetCertificationsQuery'

// =============================================================================
// loadCertifications
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadCertifications(): Promise<CertificationDTO[]> {
    const client = new HttpApiClient()
    const repo   = new ApiCertificationRepository(client)
    const query  = new GetCertificationsQuery(repo)
    return query.execute()
}