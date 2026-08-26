import type { Blog } from '../../../../domain/entities/Blog'
import type { IBlogWriteRepository } from '../../../../domain/repositories/blog/IBlogWriteRepository'
import type { UpdateBlogRequestDTO } from '../../../dtos/blog/BlogRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiBlogWriteRepository } from '../../../../infrastructure/repositories/ApiBlogWriteRepository'

export class UpdateBlogCommand {
    constructor(private readonly repo: IBlogWriteRepository) {}

    static create(): UpdateBlogCommand {
        const client = new HttpApiClient()
        const repo   = new ApiBlogWriteRepository(client)
        return new UpdateBlogCommand(repo)
    }

    async execute(id: number, input: UpdateBlogRequestDTO, accessToken: string): Promise<Blog> {
        return this.repo.update(id, input, accessToken)
    }
}
