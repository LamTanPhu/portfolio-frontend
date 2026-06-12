import type { IBlogReadRepository } from '../../../../domain/repositories/blog/IBlogReadRepository'
import type { BlogSummaryDTO }      from '../../../dtos/blog/BlogSummaryDTO'

// =============================================================================
// GetPublishedBlogsQuery
// Returns published blog summaries for list view.
// No content — use GetBlogBySlugQuery for full post.
// =============================================================================
export class GetPublishedBlogsQuery {
  constructor(private readonly repo: IBlogReadRepository) {}

  async execute(): Promise<BlogSummaryDTO[]> {
    const blogs = await this.repo.findPublished()
    return blogs.map((b) => ({
      id:          b.id,
      title:       b.title,
      slug:        b.slug,
      excerpt:     b.excerpt,
      tags:        b.tags,
      isPublished: b.isPublished,
      publishedAt: b.publishedAt?.toISOString() ?? null,
      createdAt:   b.createdAt.toISOString(),
      updatedAt:   b.createdAt.toISOString(), // BlogSummary has no updatedAt, fallback to createdAt
    }))
  }
}