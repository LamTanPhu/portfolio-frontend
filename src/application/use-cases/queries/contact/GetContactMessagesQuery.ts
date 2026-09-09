import type { IContactReadRepository } from '../../../../domain/repositories/contact/IContactReadRepository'
import type { ContactPageDTO } from '../../../dtos/ContactMessageDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiContactRepository } from '../../../../infrastructure/repositories/ApiContactRepository'

// =============================================================================
// GetContactMessagesQuery
// Admin-only, cursor-paginated. Client-callable — needs the access token
// held in AuthContext, same pattern as GetAllBlogsQuery.
// =============================================================================
export class GetContactMessagesQuery {
    constructor(private readonly repo: IContactReadRepository) {}

    static create(): GetContactMessagesQuery {
        const client = new HttpApiClient()
        const repo   = new ApiContactRepository(client)
        return new GetContactMessagesQuery(repo)
    }

    async execute(accessToken: string, cursor?: number, limit?: number): Promise<ContactPageDTO> {
        return this.repo.findMessages(accessToken, cursor, limit)
    }
}
