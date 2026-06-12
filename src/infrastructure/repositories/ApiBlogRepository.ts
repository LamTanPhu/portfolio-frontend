import type { IBlogReadRepository } from '../../domain/repositories/blog/IBlogReadRepository'
import type { IApiClient }          from '../../application/ports/IApiClient'
import type { Blog, BlogSummary }   from '../../domain/entities/Blog'
import { BlogMapper }               from '../mappers/BlogMapper'
import type { BlogSummaryDTO }      from '../../application/dtos/blog/BlogSummaryDTO'
import type { BlogDetailDTO }       from '../../application/dtos/blog/BlogDetailDTO'

// =============================================================================
// ApiBlogRepository
// findPublished — GET /blogs       → BlogSummaryDTO[] → BlogSummary[]
// findBySlug    — GET /blogs/:slug → BlogDetailDTO    → Blog
// =============================================================================
export class ApiBlogRepository implements IBlogReadRepository {
  constructor(private readonly client: IApiClient) {}

  async findPublished(): Promise<BlogSummary[]> {
    const dtos = await this.client.get<BlogSummaryDTO[]>('/blogs')
    return dtos.map(BlogMapper.toDomainSummary)
  }

  async findBySlug(slug: string): Promise<Blog | null> {
    try {
      const dto = await this.client.get<BlogDetailDTO>(`/blogs/${slug}`)
      return BlogMapper.toDomain(dto)
    } catch {
      return null
    }
  }
}