import { ApiBlogRepository } from '../../../infrastructure/repositories/ApiBlogRepository'
import { GetPublishedBlogsQuery } from '../../../application/use-cases/queries/blog/GetPublishedBlogsQuery'
import type { BlogDTO } from '../../../application/dtos/BlogDTO'

// =============================================================================
// loadBlogs
// Server-only loader — called from Server Components only.
// =============================================================================
export async function loadBlogs(): Promise<BlogDTO[]> {
  const repo  = new ApiBlogRepository()
  const query = new GetPublishedBlogsQuery(repo)
  return query.execute()
}
