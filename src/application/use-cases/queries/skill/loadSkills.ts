import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSkillRepository } from '../../../../infrastructure/repositories/ApiSkillRepository'
import type { SkillDTO } from '../../../dtos/skill/SkillDTO'
import { GetPublishedSkillsQuery } from './GetPublishedSkillsQuery'

// =============================================================================
// loadSkills
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadSkills(): Promise<SkillDTO[]> {
  const client = new HttpApiClient()
  const repo   = new ApiSkillRepository(client)
  const query  = new GetPublishedSkillsQuery(repo)
  return query.execute()
}