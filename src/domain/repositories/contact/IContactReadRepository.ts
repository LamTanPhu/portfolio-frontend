import type { ContactPageDTO } from '../../../application/dtos/ContactMessageDTO'

// =============================================================================
// IContactReadRepository
// Admin-only — every method requires a valid access token. Separate from
// IContactWriteRepository (Interface Segregation, same split the backend
// uses) since the public contact form never needs to read messages back.
// =============================================================================
export interface IContactReadRepository {
    findMessages(accessToken: string, cursor?: number, limit?: number): Promise<ContactPageDTO>
}
