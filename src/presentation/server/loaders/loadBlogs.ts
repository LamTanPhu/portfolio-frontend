import { GetPublishedBlogsQuery } from '../../../application/use-cases/queries/blog/GetPublishedBlogsQuery'
import { BlogDTO } from '../../../application/dtos/BlogDTO'

export async function loadBlogs(): Promise<BlogDTO[]> {
  // Wire ApiProjectRepository equivalent for blogs here
  throw new Error('ApiBlogRepository not yet implemented')
}
