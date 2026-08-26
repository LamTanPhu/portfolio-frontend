import type { Blog } from '../../entities/Blog'
import type { CreateBlogRequestDTO, UpdateBlogRequestDTO } from '../../../application/dtos/blog/BlogRequestDTO'

// =============================================================================
// IBlogWriteRepository
// Admin-only — every method requires a valid access token (Bearer, behind
// JwtAuthGuard on the backend). create/update return the full Blog (detail)
// the same way the backend's POST/PATCH /blogs responses do.
// =============================================================================
export interface IBlogWriteRepository {
    create(input: CreateBlogRequestDTO, accessToken: string): Promise<Blog>
    update(id: number, input: UpdateBlogRequestDTO, accessToken: string): Promise<Blog>
    delete(id: number, accessToken: string): Promise<void>
}
