import type { Education } from '../../../../domain/entities/Education'
import type { IEducationWriteRepository } from '../../../../domain/repositories/education/IEducationWriteRepository'
import type { UpdateEducationRequestDTO } from '../../../dtos/education/UpdateEducationRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiEducationWriteRepository } from '../../../../infrastructure/repositories/ApiEducationWriteRepository'

export class UpdateEducationCommand {
    constructor(private readonly repo: IEducationWriteRepository) {}

    static create(): UpdateEducationCommand {
        const client = new HttpApiClient()
        const repo   = new ApiEducationWriteRepository(client)
        return new UpdateEducationCommand(repo)
    }

    async execute(id: number, input: UpdateEducationRequestDTO, accessToken: string): Promise<Education> {
        return this.repo.update(id, input, accessToken)
    }
}
