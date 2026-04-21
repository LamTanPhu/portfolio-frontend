import { Blog } from '../../entities/Blog'

export interface IBlogWriteRepository {
  create(data: Omit<Blog, 'id'>): Promise<Blog>
  update(id: number, data: Partial<Blog>): Promise<Blog>
  delete(id: number): Promise<void>
}
