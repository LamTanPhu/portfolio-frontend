import { createServerApiClient } from '../../../../infrastructure/api/createServerApiClient'
import { ApiBlogRepository }      from '../../../../infrastructure/repositories/ApiBlogRepository'
import { GetPublishedBlogsQuery } from './GetPublishedBlogsQuery'
import type { BlogSummaryDTO }    from '../../../dtos/blog/BlogSummaryDTO'

// =============================================================================
// loadPublicBlogs
// Server-only loader for the PUBLIC pages — same as loadBlogs, but reads fall
// back to data/api-snapshot.json when the backend is down (see SNAPSHOT.md).
// Admin screens keep using loadBlogs: they must show live data or an error.
// Returns BlogSummaryDTO[] — no content field.
// =============================================================================
export async function loadPublicBlogs(): Promise<BlogSummaryDTO[]> {
  const client = createServerApiClient()
  const repo   = new ApiBlogRepository(client)
  const query  = new GetPublishedBlogsQuery(repo)
  return query.execute()
}