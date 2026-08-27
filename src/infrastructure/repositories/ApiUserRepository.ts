import type { User } from '../../domain/entities/User'
import type { IUserReadRepository } from '../../domain/repositories/user/IUserReadRepository'
import type { IUserWriteRepository } from '../../domain/repositories/user/IUserWriteRepository'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { UserProfileDTO, UpdateUserRequestDTO } from '../../application/dtos/UserProfileDTO'
import { UserMapper } from '../mappers/UserMapper'

// =============================================================================
// ApiUserRepository
// getProfile    — GET   /user/profile
// updateProfile — PATCH /user/profile
// Implements both read and write ports in one class — unlike the list-based
// entities (Blog, Project, ...), there is exactly one User record per admin
// and both endpoints share the same resource path, so a single client
// wrapping /user/profile is simpler than mirroring the Read/Write split.
// =============================================================================
export class ApiUserRepository implements IUserReadRepository, IUserWriteRepository {
    constructor(private readonly client: IApiClient) {}

    async getProfile(accessToken: string): Promise<User> {
        const dto = await this.client.get<UserProfileDTO>('/user/profile', 0, { accessToken })
        return UserMapper.toDomain(dto)
    }

    async updateProfile(input: UpdateUserRequestDTO, accessToken: string): Promise<User> {
        const dto = await this.client.patch<UserProfileDTO>('/user/profile', input, { accessToken })
        return UserMapper.toDomain(dto)
    }
}
