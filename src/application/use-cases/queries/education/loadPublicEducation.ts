import { createServerApiClient } from '../../../../infrastructure/api/createServerApiClient'
import { ApiEducationRepository } from '../../../../infrastructure/repositories/ApiEducationRepository'
import type { EducationDTO } from '../../../dtos/education/EducationDTO'
import { GetEducationQuery } from './GetEducationQuery'

// =============================================================================
// loadPublicEducation
// Server-only loader for the PUBLIC pages — same as loadEducation, but reads fall
// back to data/api-snapshot.json when the backend is down (see SNAPSHOT.md).
// Admin screens keep using loadEducation: they must show live data or an error.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadPublicEducation(): Promise<EducationDTO[]> {
  const client = createServerApiClient()
  const repo   = new ApiEducationRepository(client)
  const query  = new GetEducationQuery(repo)
  return query.execute()
}