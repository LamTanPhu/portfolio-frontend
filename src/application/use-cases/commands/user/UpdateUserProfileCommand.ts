import type { User } from '../../../../domain/entities/User'
import type { IUserWriteRepository } from '../../../../domain/repositories/user/IUserWriteRepository'
import type { UpdateUserRequestDTO } from '../../../dtos/UserProfileDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiUserRepository } from '../../../../infrastructure/repositories/ApiUserRepository'

export class UpdateUserProfileCommand {
    constructor(private readonly repo: IUserWriteRepository) {}

    static create(): UpdateUserProfileCommand {
        const client = new HttpApiClient()
        const repo   = new ApiUserRepository(client)
        return new UpdateUserProfileCommand(repo)
    }

    async execute(input: UpdateUserRequestDTO, accessToken: string): Promise<User> {
        return this.repo.updateProfile(input, accessToken)
    }
}
