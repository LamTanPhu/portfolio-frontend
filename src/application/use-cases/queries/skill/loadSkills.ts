import { ApiSkillRepository }      from '../../../../infrastructure/repositories/ApiSkillRepository'
import { GetPublishedSkillsQuery }  from './GetPublishedSkillsQuery'
import type { SkillDTO }            from '../../../dtos/SkillDTO'

// =============================================================================
// loadSkills
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadSkills(): Promise<SkillDTO[]> {
  const repo  = new ApiSkillRepository()
  const query = new GetPublishedSkillsQuery(repo)
  return query.execute()
}