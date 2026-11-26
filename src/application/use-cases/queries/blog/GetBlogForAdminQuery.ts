import type { IBlogReadRepository } from '../../../../domain/repositories/blog/IBlogReadRepository'
import type { BlogDetailDTO }       from '../../../dtos/blog/BlogDetailDTO'
import { HttpApiClient }            from '../../../../infrastructure/api/HttpApiClient'
import { ApiBlogRepository }        from '../../../../infrastructure/repositories/ApiBlogRepository'

// =============================================================================
// GetBlogForAdminQuery
// Admin-only — ONE post by slug, draft or published (GET /blogs/admin/:slug).
// The public GET /blogs/:slug answers 404 for drafts, so the edit form cannot
// use it. Client-callable (not a server loader) since it needs the access token
// held in AuthContext, passed in at execute-time. Returns null on a genuine 404.
// =============================================================================
export class GetBlogForAdminQuery {
  constructor(private readonly repo: IBlogReadRepository) {}

  static create(): GetBlogForAdminQuery {
    const client = new HttpApiClient()
    const repo   = new ApiBlogRepository(client)
    return new GetBlogForAdminQuery(repo)
  }

  async execute(slug: string, accessToken: string): Promise<BlogDetailDTO | null> {
    const blog = await this.repo.findBySlugAdmin(slug, accessToken)
    if (!blog) return null

    return {
      id:          blog.id,
      title:       blog.title,
      slug:        blog.slug,
      content:     blog.content,
      excerpt:     blog.excerpt,
      tags:        blog.tags,
      isPublished: blog.isPublished,
      publishedAt: blog.publishedAt?.toISOString() ?? null,
      createdAt:   blog.createdAt.toISOString(),
      updatedAt:   blog.updatedAt?.toISOString(),
    }
  }
}
