import type { SocialAccount } from '../../entities/SocialAccount'
import type { CreateSocialAccountRequestDTO } from '../../../application/dtos/socialAccount/CreateSocialAccountRequestDTO'
import type { UpdateSocialAccountRequestDTO } from '../../../application/dtos/socialAccount/UpdateSocialAccountRequestDTO'

// =============================================================================
// ISocialAccountWriteRepository
// Admin-only — every method requires a valid access token.
// =============================================================================
export interface ISocialAccountWriteRepository {
    create(input: CreateSocialAccountRequestDTO, accessToken: string): Promise<SocialAccount>
    update(id: number, input: UpdateSocialAccountRequestDTO, accessToken: string): Promise<SocialAccount>
    delete(id: number, accessToken: string): Promise<void>
}
