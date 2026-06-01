import { ApiBlogRepository }      from '../../../../infrastructure/repositories/ApiBlogRepository'
import { GetPublishedBlogsQuery }  from './GetPublishedBlogsQuery'
import type { BlogDTO }            from '../../../dtos/BlogDTO'

// =============================================================================
// loadBlogs
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadBlogs(): Promise<BlogDTO[]> {
  const repo  = new ApiBlogRepository()
  const query = new GetPublishedBlogsQuery(repo)
  return query.execute()
}