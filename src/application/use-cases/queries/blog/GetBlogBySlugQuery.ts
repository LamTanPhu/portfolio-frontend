import type { IBlogReadRepository } from '../../../../domain/repositories/blog/IBlogReadRepository'
import type { BlogDetailDTO }       from '../../../dtos/blog/BlogDetailDTO'

// =============================================================================
// GetBlogBySlugQuery
// Returns a single blog post with full content for detail view.
// Returns null if not found.
// =============================================================================
export class GetBlogBySlugQuery {
    constructor(private readonly repo: IBlogReadRepository) {}

    async execute(slug: string): Promise<BlogDetailDTO | null> {
        const blog = await this.repo.findBySlug(slug)
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
            updatedAt:   blog.updatedAt.toISOString(),
        }
    }
}