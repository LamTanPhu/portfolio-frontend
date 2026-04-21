import { IBlogReadRepository } from '../../../../domain/repositories/blog/IBlogReadRepository'
import { BlogDTO } from '../../../dtos/BlogDTO'

export class GetPublishedBlogsQuery {
  constructor(private readonly repo: IBlogReadRepository) {}

  async execute(): Promise<BlogDTO[]> {
    const blogs = await this.repo.findPublished()
    return blogs.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      content: b.content,
      tags: b.tags,
      createdAt: b.createdAt.toISOString(),
    }))
  }
}
