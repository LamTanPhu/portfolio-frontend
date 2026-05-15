import { get } from '../../../infrastructure/api/httpClient'
import type { SocialAccountDTO } from '../../../application/dtos/SocialAccountDTO'

// =============================================================================
// loadSocialAccounts
// Server-only loader — called from Server Components only.
// =============================================================================
export async function loadSocialAccounts(): Promise<SocialAccountDTO[]> {
  return get<SocialAccountDTO[]>('/social')
}
