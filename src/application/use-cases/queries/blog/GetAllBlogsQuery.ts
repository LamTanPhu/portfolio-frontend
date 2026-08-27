import type { IBlogReadRepository } from '../../../../domain/repositories/blog/IBlogReadRepository'
import type { BlogSummaryDTO }      from '../../../dtos/blog/BlogSummaryDTO'
import { HttpApiClient }            from '../../../../infrastructure/api/HttpApiClient'
import { ApiBlogRepository }        from '../../../../infrastructure/repositories/ApiBlogRepository'

// =============================================================================
// GetAllBlogsQuery
// Admin-only — every post including drafts. Client-callable (not a server
// loader like loadBlogs.ts) since it needs the access token held in
// AuthContext, passed in at execute-time like the write commands.
// =============================================================================
export class GetAllBlogsQuery {
  constructor(private readonly repo: IBlogReadRepository) {}

  static create(): GetAllBlogsQuery {
    const client = new HttpApiClient()
    const repo   = new ApiBlogRepository(client)
    return new GetAllBlogsQuery(repo)
  }

  async execute(accessToken: string): Promise<BlogSummaryDTO[]> {
    const blogs = await this.repo.findAllAdmin(accessToken)
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
