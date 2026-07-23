import type { SocialAccountDTO } from '../../application/dtos/socialAccount/SocialAccountDTO'
import { SocialAccount } from '../../domain/entities/SocialAccount'

// =============================================================================
// SocialAccountMapper
// Converts between SocialAccountDTO (API shape) and SocialAccount domain entity.
// =============================================================================
export class SocialAccountMapper {
    static toDomain(dto: SocialAccountDTO): SocialAccount {
        return new SocialAccount(
            dto.id,
            dto.name,
            dto.url,
            dto.imageUrl,
        )
    }

    static toDTO(account: SocialAccount): SocialAccountDTO {
        return {
            id:       account.id,
            name:     account.name,
            url:      account.url,
            imageUrl: account.imageUrl,
            isPublic: true,
        }
    }
}