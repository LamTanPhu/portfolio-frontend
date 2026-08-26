import type { Education } from '../../../../domain/entities/Education'
import type { IEducationWriteRepository } from '../../../../domain/repositories/education/IEducationWriteRepository'
import type { CreateEducationRequestDTO } from '../../../dtos/education/CreateEducationRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiEducationWriteRepository } from '../../../../infrastructure/repositories/ApiEducationWriteRepository'

export class CreateEducationCommand {
    constructor(private readonly repo: IEducationWriteRepository) {}

    static create(): CreateEducationCommand {
        const client = new HttpApiClient()
        const repo   = new ApiEducationWriteRepository(client)
        return new CreateEducationCommand(repo)
    }

    async execute(input: CreateEducationRequestDTO, accessToken: string): Promise<Education> {
        return this.repo.create(input, accessToken)
    }
}
