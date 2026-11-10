import { ApiCertificationRepository } from '@/src/infrastructure/repositories/ApiCertificationRepository'
import { createServerApiClient } from '../../../../infrastructure/api/createServerApiClient'
import type { CertificationDTO } from '../../../dtos/certification/CertificationDTO'
import { GetCertificationsQuery } from './GetCertificationsQuery'

// =============================================================================
// loadPublicCertifications
// Server-only loader for the PUBLIC pages — same as loadCertifications, but reads fall
// back to data/api-snapshot.json when the backend is down (see SNAPSHOT.md).
// Admin screens keep using loadCertifications: they must show live data or an error.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadPublicCertifications(): Promise<CertificationDTO[]> {
    const client = createServerApiClient()
    const repo   = new ApiCertificationRepository(client)
    const query  = new GetCertificationsQuery(repo)
    return query.execute()
}