import { ApiSocialAccountRepository }      from '../../../../infrastructure/repositories/ApiSocialAccountRepository'
import { GetPublishedSocialAccountsQuery }  from './GetPublishedSocialAccountsQuery'
import type { SocialAccountDTO }            from '../../../dtos/SocialAccountDTO'

// =============================================================================
// loadSocialAccounts
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadSocialAccounts(): Promise<SocialAccountDTO[]> {
  const repo  = new ApiSocialAccountRepository()
  const query = new GetPublishedSocialAccountsQuery(repo)
  return query.execute()
}