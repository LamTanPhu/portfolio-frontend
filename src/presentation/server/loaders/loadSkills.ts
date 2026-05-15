import { get } from '../../../infrastructure/api/httpClient'
import type { SkillDTO } from '../../../application/dtos/SkillDTO'

// =============================================================================
// loadSkills
// Server-only loader — called from Server Components only.
// =============================================================================
export async function loadSkills(): Promise<SkillDTO[]> {
  return get<SkillDTO[]>('/about/skills')
}
