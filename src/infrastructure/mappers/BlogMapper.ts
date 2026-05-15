import { Blog } from '../../domain/entities/Blog'
import type { BlogDTO } from '../../application/dtos/BlogDTO'

// =============================================================================
// BlogMapper
// Converts raw API response → domain entity.
// =============================================================================
export class BlogMapper {
  static toDomain(dto: BlogDTO): Blog {
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
    )
  }
}
