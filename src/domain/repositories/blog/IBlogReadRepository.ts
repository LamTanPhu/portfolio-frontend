import type { Blog } from '../../entities/Blog'
export interface IBlogReadRepository {
  findPublished(): Promise<Blog[]>
  findBySlug(slug: string): Promise<Blog | null>
}