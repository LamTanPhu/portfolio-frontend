import { Blog, BlogSummary } from '../../domain/entities/Blog'
import type { BlogSummaryDTO, BlogDetailDTO } from '../../application/dtos/BlogDTO'

// =============================================================================
// BlogMapper
// Converts raw API responses → domain entities.
// toSummary: used for list views (GET /api/blogs)
// toDetail:  used for single post views (GET /api/blogs/:slug)
// =============================================================================
export class BlogMapper {
  static toSummary(dto: BlogSummaryDTO): BlogSummary {
    return new BlogSummary(
      dto.id,
      dto.title,
      dto.slug,
      dto.excerpt,
      dto.tags,
      dto.isPublished,
      dto.publishedAt ? new Date(dto.publishedAt) : null,
      new Date(dto.createdAt),
    )
  }

  static toDetail(dto: BlogDetailDTO): Blog {
    return new Blog(
      dto.id,
      dto.title,
      dto.slug,
      dto.content,
      dto.excerpt,
      dto.tags,
      dto.isPublished,
      dto.publishedAt ? new Date(dto.publishedAt) : null,
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
    )
  }
}