import { Blog }               from '../../domain/entities/Blog'
import { BlogSummary }        from '../../domain/entities/Blog'
import type { BlogSummaryDTO } from '../../application/dtos/blog/BlogSummaryDTO'
import type { BlogDetailDTO }  from '../../application/dtos/blog/BlogDetailDTO'

// =============================================================================
// BlogMapper
// toDomainSummary — BlogSummaryDTO → BlogSummary (list view, no content)
// toDomain        — BlogDetailDTO  → Blog        (detail view, full content)
// =============================================================================
export class BlogMapper {
  static toDomainSummary(dto: BlogSummaryDTO): BlogSummary {
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

  static toDomain(dto: BlogDetailDTO): Blog {
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