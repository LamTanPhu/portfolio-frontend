import type { IBlogReadRepository } from '../../../../domain/repositories/blog/IBlogReadRepository'
import type { BlogDTO } from '../../../dtos/BlogDTO'

// =============================================================================
// GetPublishedBlogsQuery
// Returns published blog summaries for list view.
// =============================================================================
export class GetPublishedBlogsQuery {
  constructor(private readonly repo: IBlogReadRepository) {}

  async execute(): Promise<BlogDTO[]> {
    const blogs = await this.repo.findPublished()
    return blogs.map((b) => ({
      id:          b.id,
      title:       b.title,
      slug:        b.slug,
      content:     b.content,
      excerpt:     b.excerpt,
      tags:        b.tags,
      isPublished: b.isPublished,
      publishedAt: b.publishedAt?.toISOString() ?? null,
      createdAt:   b.createdAt.toISOString(),
    }))
  }
}
