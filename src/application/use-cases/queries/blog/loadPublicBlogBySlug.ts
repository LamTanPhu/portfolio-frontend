import { createServerApiClient } from '../../../../infrastructure/api/createServerApiClient'
import { ApiBlogRepository }  from '../../../../infrastructure/repositories/ApiBlogRepository'
import { GetBlogBySlugQuery } from './GetBlogBySlugQuery'
import type { BlogDetailDTO } from '../../../dtos/blog/BlogDetailDTO'

// =============================================================================
// loadPublicBlogBySlug
// Server-only loader for the PUBLIC pages — same as loadBlogBySlug, but reads fall
// back to data/api-snapshot.json when the backend is down (see SNAPSHOT.md).
// Admin screens keep using loadBlogBySlug: they must show live data or an error.
// Composition root: wires infrastructure repository to application query.
// Returns null when no published post matches the slug (query already
// distinguishes 404 from real failures — see ApiBlogRepository).
// =============================================================================
export async function loadPublicBlogBySlug(slug: string): Promise<BlogDetailDTO | null> {
    const client = createServerApiClient()
    const repo   = new ApiBlogRepository(client)
    const query  = new GetBlogBySlugQuery(repo)
    return query.execute(slug)
}