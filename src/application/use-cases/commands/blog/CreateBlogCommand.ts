import type { Blog } from '../../../../domain/entities/Blog'
import type { IBlogWriteRepository } from '../../../../domain/repositories/blog/IBlogWriteRepository'
import type { CreateBlogRequestDTO } from '../../../dtos/blog/BlogRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiBlogWriteRepository } from '../../../../infrastructure/repositories/ApiBlogWriteRepository'

// =============================================================================
// CreateBlogCommand
// Client-callable — called from an admin form after login, so the access
// token comes from AuthContext (React state) and is passed at execute-time,
// never stored on the command itself.
// =============================================================================
export class CreateBlogCommand {
    constructor(private readonly repo: IBlogWriteRepository) {}

    static create(): CreateBlogCommand {
        const client = new HttpApiClient()
        const repo   = new ApiBlogWriteRepository(client)
        return new CreateBlogCommand(repo)
    }

    async execute(input: CreateBlogRequestDTO, accessToken: string): Promise<Blog> {
        return this.repo.create(input, accessToken)
    }
}
