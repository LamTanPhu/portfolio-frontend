import type { IBlogWriteRepository } from '../../../../domain/repositories/blog/IBlogWriteRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiBlogWriteRepository } from '../../../../infrastructure/repositories/ApiBlogWriteRepository'

export class DeleteBlogCommand {
    constructor(private readonly repo: IBlogWriteRepository) {}

    static create(): DeleteBlogCommand {
        const client = new HttpApiClient()
        const repo   = new ApiBlogWriteRepository(client)
        return new DeleteBlogCommand(repo)
    }

    async execute(id: number, accessToken: string): Promise<void> {
        await this.repo.delete(id, accessToken)
    }
}
