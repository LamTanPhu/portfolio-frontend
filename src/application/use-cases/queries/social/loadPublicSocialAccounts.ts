import { createServerApiClient } from '../../../../infrastructure/api/createServerApiClient'
import { ApiSocialAccountRepository } from '../../../../infrastructure/repositories/ApiSocialAccountRepository'
import type { SocialAccountDTO } from '../../../dtos/socialAccount/SocialAccountDTO'
import { GetPublishedSocialAccountsQuery } from './GetPublishedSocialAccountsQuery'

// =============================================================================
// loadPublicSocialAccounts
// Server-only loader for the PUBLIC pages — same as loadSocialAccounts, but reads fall
// back to data/api-snapshot.json when the backend is down (see SNAPSHOT.md).
// Admin screens keep using loadSocialAccounts: they must show live data or an error.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadPublicSocialAccounts(): Promise<SocialAccountDTO[]> {
  const client = createServerApiClient()
  const repo   = new ApiSocialAccountRepository(client)
  const query  = new GetPublishedSocialAccountsQuery(repo)
  return query.execute()
}