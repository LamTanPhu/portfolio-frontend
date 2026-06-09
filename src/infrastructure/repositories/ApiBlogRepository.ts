import type { IBlogReadRepository } from '../../domain/repositories/blog/IBlogReadRepository'
import { Blog, BlogSummary } from '../../domain/entities/Blog'
import { BlogMapper } from '../mappers/BlogMapper'
import type { BlogSummaryDTO, BlogDetailDTO } from '../../application/dtos/BlogDTO'
import { get } from '../api/httpClient'

// =============================================================================
// ApiBlogRepository
// Implements IBlogReadRepository using the backend REST API.
//
// findPublished → GET /api/blogs   → BlogSummaryDTO[] (no content)
// findBySlug   → GET /api/blogs/:slug → BlogDetailDTO (with content)
// =============================================================================
export class ApiBlogRepository implements IBlogReadRepository {
  async findPublished(): Promise<BlogSummary[]> {
    const dtos = await get<BlogSummaryDTO[]>('/blogs')
    return dtos.map(BlogMapper.toSummary)
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    try {
      const dto = await get<BlogDetailDTO>(`/blogs/${slug}`)
      return BlogMapper.toDetail(dto)
    } catch {
      return null
    }
  }
}