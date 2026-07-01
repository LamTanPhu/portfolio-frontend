import { HttpApiClient }      from '../../../../infrastructure/api/HttpApiClient'
import { ApiBlogRepository }  from '../../../../infrastructure/repositories/ApiBlogRepository'
import { GetBlogBySlugQuery } from './GetBlogBySlugQuery'
import type { BlogDetailDTO } from '../../../dtos/blog/BlogDetailDTO'

// =============================================================================
// loadBlogBySlug
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// Returns null when no published post matches the slug (query already
// distinguishes 404 from real failures — see ApiBlogRepository).
// =============================================================================
export async function loadBlogBySlug(slug: string): Promise<BlogDetailDTO | null> {
    const client = new HttpApiClient()
    const repo   = new ApiBlogRepository(client)
    const query  = new GetBlogBySlugQuery(repo)
    return query.execute(slug)
}