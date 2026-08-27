import type { Blog }        from '../../entities/Blog'
import type { BlogSummary } from '../../entities/Blog'

// =============================================================================
// IBlogReadRepository
// findPublished — returns lightweight summaries for list view (public)
// findBySlug    — returns full Blog with content for detail view (public)
// findAllAdmin  — returns every post including drafts, admin-only
// =============================================================================
export interface IBlogReadRepository {
  findPublished(): Promise<BlogSummary[]>
  findBySlug(slug: string): Promise<Blog | null>
  findAllAdmin(accessToken: string): Promise<BlogSummary[]>
}