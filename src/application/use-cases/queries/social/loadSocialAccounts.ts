import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSocialAccountRepository } from '../../../../infrastructure/repositories/ApiSocialAccountRepository'
import type { SocialAccountDTO } from '../../../dtos/socialAccount/SocialAccountDTO'
import { GetPublishedSocialAccountsQuery } from './GetPublishedSocialAccountsQuery'

// =============================================================================
// loadSocialAccounts
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadSocialAccounts(): Promise<SocialAccountDTO[]> {
  const client = new HttpApiClient()
  const repo   = new ApiSocialAccountRepository(client)
  const query  = new GetPublishedSocialAccountsQuery(repo)
  return query.execute()
}