import type { IBlogReadRepository } from '../../domain/repositories/blog/IBlogReadRepository'
import { Blog } from '../../domain/entities/Blog'
import { BlogMapper } from '../mappers/BlogMapper'
import type { BlogDTO } from '../../application/dtos/BlogDTO'
import { get } from '../api/httpClient'

// =============================================================================
// ApiBlogRepository
// Implements IBlogReadRepository using the backend REST API.
// =============================================================================
export class ApiBlogRepository implements IBlogReadRepository {
  async findPublished(): Promise<Blog[]> {
    const dtos = await get<BlogDTO[]>('/blogs')
    return dtos.map(BlogMapper.toDomain)
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    try {
      const dto = await get<BlogDTO>(`/blogs/${slug}`)
      return BlogMapper.toDomain(dto)
    } catch {
      return null
    }
  }
}
