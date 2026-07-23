import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiEducationRepository } from '../../../../infrastructure/repositories/ApiEducationRepository'
import type { EducationDTO } from '../../../dtos/education/EducationDTO'
import { GetEducationQuery } from './GetEducationQuery'

// =============================================================================
// loadEducation
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadEducation(): Promise<EducationDTO[]> {
  const client = new HttpApiClient()
  const repo   = new ApiEducationRepository(client)
  const query  = new GetEducationQuery(repo)
  return query.execute()
}