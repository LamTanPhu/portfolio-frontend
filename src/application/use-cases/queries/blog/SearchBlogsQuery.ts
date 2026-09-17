import type { IBlogReadRepository } from '../../../../domain/repositories/blog/IBlogReadRepository'
import type { BlogSummaryDTO }      from '../../../dtos/blog/BlogSummaryDTO'
import { HttpApiClient }            from '../../../../infrastructure/api/HttpApiClient'
import { ApiBlogRepository }        from '../../../../infrastructure/repositories/ApiBlogRepository'

// =============================================================================
// SearchBlogsQuery
// Public, client-callable — driven by a search box on the (client-rendered)
// blog page, so this is invoked from an effect/handler rather than a server
// loader like loadBlogs.ts. Mirrors GetAllBlogsQuery's create() pattern.
//
// Empty/whitespace-only queries resolve to [] without hitting the network —
// the backend rejects them (MinLength(1) on ?q=) and there's nothing useful
// to show for a blank search anyway.
// =============================================================================
export class SearchBlogsQuery {
  constructor(private readonly repo: IBlogReadRepository) {}

  static create(): SearchBlogsQuery {
    const client = new HttpApiClient()
    const repo   = new ApiBlogRepository(client)
    return new SearchBlogsQuery(repo)
  }

  async execute(query: string): Promise<BlogSummaryDTO[]> {
    const trimmed = query.trim()
    if (trimmed.length === 0) return []

    const blogs = await this.repo.search(trimmed)
    return blogs.map((b) => ({
      id:          b.id,
      title:       b.title,
      slug:        b.slug,
      excerpt:     b.excerpt,
      tags:        b.tags,
      isPublished: b.isPublished,
      publishedAt: b.publishedAt?.toISOString() ?? null,
      createdAt:   b.createdAt.toISOString(),
      updatedAt:   b.createdAt.toISOString(), // BlogSummary has no updatedAt, fallback to createdAt — same as GetPublishedBlogsQuery
    }))
  }
}
