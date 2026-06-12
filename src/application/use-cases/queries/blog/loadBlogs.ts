import { HttpApiClient }          from '../../../../infrastructure/api/HttpApiClient'
import { ApiBlogRepository }      from '../../../../infrastructure/repositories/ApiBlogRepository'
import { GetPublishedBlogsQuery } from './GetPublishedBlogsQuery'
import type { BlogSummaryDTO }    from '../../../dtos/blog/BlogSummaryDTO'

// =============================================================================
// loadBlogs
// Server-only loader — called from Server Components only.
// Returns BlogSummaryDTO[] — no content field.
// =============================================================================
export async function loadBlogs(): Promise<BlogSummaryDTO[]> {
  const client = new HttpApiClient()
  const repo   = new ApiBlogRepository(client)
  const query  = new GetPublishedBlogsQuery(repo)
  return query.execute()
}