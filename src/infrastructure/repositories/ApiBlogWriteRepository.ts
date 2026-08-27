import type { Blog } from '../../domain/entities/Blog'
import type { IBlogWriteRepository } from '../../domain/repositories/blog/IBlogWriteRepository'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { CreateBlogRequestDTO, UpdateBlogRequestDTO } from '../../application/dtos/blog/BlogRequestDTO'
import type { BlogDetailDTO } from '../../application/dtos/blog/BlogDetailDTO'
import { BlogMapper } from '../mappers/BlogMapper'

// =============================================================================
// ApiBlogWriteRepository
// create — POST  /blogs
// update — PATCH /blogs/:id
// delete — DELETE /blogs/:id
// All three are admin-only — accessToken is required and sent as a Bearer
// header. No withCredentials here: these calls don't need the httpOnly
// refresh cookie, only the access token already held by the caller.
// =============================================================================
export class ApiBlogWriteRepository implements IBlogWriteRepository {
    constructor(private readonly client: IApiClient) {}

    async create(input: CreateBlogRequestDTO, accessToken: string): Promise<Blog> {
        const dto = await this.client.post<BlogDetailDTO>('/blogs', input, { accessToken })
        return BlogMapper.toDomain(dto)
    }

    async update(id: number, input: UpdateBlogRequestDTO, accessToken: string): Promise<Blog> {
        const dto = await this.client.patch<BlogDetailDTO>(`/blogs/${id}`, input, { accessToken })
        return BlogMapper.toDomain(dto)
    }

    async delete(id: number, accessToken: string): Promise<void> {
        await this.client.delete<void>(`/blogs/${id}`, { accessToken })
    }
}
