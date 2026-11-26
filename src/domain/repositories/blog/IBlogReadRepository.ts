import type { Blog }        from '../../entities/Blog'
import type { BlogSummary } from '../../entities/Blog'

// =============================================================================
// IBlogReadRepository
// findPublished — returns lightweight summaries for list view (public)
// findBySlug    — returns full Blog with content for detail view (public —
//                 the backend answers 404 for an unpublished draft)
// findAllAdmin  — returns every post including drafts, admin-only
// findBySlugAdmin — returns one post by slug, draft or published, admin-only
// search        — full-text search over published posts (public)
// =============================================================================
export interface IBlogReadRepository {
  findPublished(): Promise<BlogSummary[]>
  findBySlug(slug: string): Promise<Blog | null>
  findAllAdmin(accessToken: string): Promise<BlogSummary[]>
  findBySlugAdmin(slug: string, accessToken: string): Promise<Blog | null>
  search(query: string): Promise<BlogSummary[]>
}