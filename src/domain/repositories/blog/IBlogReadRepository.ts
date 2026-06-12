import type { Blog }        from '../../entities/Blog'
import type { BlogSummary } from '../../entities/Blog'

// =============================================================================
// IBlogReadRepository
// findPublished — returns lightweight summaries for list view
// findBySlug    — returns full Blog with content for detail view
// =============================================================================
export interface IBlogReadRepository {
  findPublished(): Promise<BlogSummary[]>
  findBySlug(slug: string): Promise<Blog | null>
}