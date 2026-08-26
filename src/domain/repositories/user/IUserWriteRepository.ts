import type { User } from '../../entities/User'
import type { UpdateUserRequestDTO } from '../../../application/dtos/UserProfileDTO'

// =============================================================================
// IUserWriteRepository
// Admin-only. Email and password are intentionally not editable here —
// mirrors the backend, which excludes both from UpdateUserDto.
// =============================================================================
export interface IUserWriteRepository {
    updateProfile(input: UpdateUserRequestDTO, accessToken: string): Promise<User>
}
