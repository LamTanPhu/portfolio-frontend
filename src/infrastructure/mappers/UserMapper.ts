import type { UserProfileDTO } from '../../application/dtos/UserProfileDTO'
import { User } from '../../domain/entities/User'

// =============================================================================
// UserMapper
// Converts between UserProfileDTO (API shape) and User domain entity.
// =============================================================================
export class UserMapper {
    static toDomain(dto: UserProfileDTO): User {
        return new User(
            dto.id,
            dto.firstname,
            dto.lastname,
            dto.email,
            dto.aboutme,
            dto.lastLogin ? new Date(dto.lastLogin) : null,
        )
    }
}
