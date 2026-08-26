import type { Job } from '../../../../domain/entities/Job'
import type { IJobWriteRepository } from '../../../../domain/repositories/job/IJobWriteRepository'
import type { CreateJobRequestDTO } from '../../../dtos/job/CreateJobRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiJobWriteRepository } from '../../../../infrastructure/repositories/ApiJobWriteRepository'

export class CreateJobCommand {
    constructor(private readonly repo: IJobWriteRepository) {}

    static create(): CreateJobCommand {
        const client = new HttpApiClient()
        const repo   = new ApiJobWriteRepository(client)
        return new CreateJobCommand(repo)
    }

    async execute(input: CreateJobRequestDTO, accessToken: string): Promise<Job> {
        return this.repo.create(input, accessToken)
    }
}
