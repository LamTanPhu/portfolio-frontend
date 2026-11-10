import { createServerApiClient } from '../../../../infrastructure/api/createServerApiClient'
import { ApiSkillRepository } from '../../../../infrastructure/repositories/ApiSkillRepository'
import type { SkillDTO } from '../../../dtos/skill/SkillDTO'
import { GetPublishedSkillsQuery } from './GetPublishedSkillsQuery'

// =============================================================================
// loadPublicSkills
// Server-only loader for the PUBLIC pages — same as loadSkills, but reads fall
// back to data/api-snapshot.json when the backend is down (see SNAPSHOT.md).
// Admin screens keep using loadSkills: they must show live data or an error.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadPublicSkills(): Promise<SkillDTO[]> {
  const client = createServerApiClient()
  const repo   = new ApiSkillRepository(client)
  const query  = new GetPublishedSkillsQuery(repo)
  return query.execute()
}