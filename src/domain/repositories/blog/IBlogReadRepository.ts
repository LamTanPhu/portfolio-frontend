import type { Blog, BlogSummary } from '../../entities/Blog'
export interface IBlogReadRepository {
  findPublished(): Promise<BlogSummary[]>
  findBySlug(slug: string): Promise<Blog | null>
}