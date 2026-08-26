import type { Job } from '../../../../domain/entities/Job'
import type { IJobWriteRepository } from '../../../../domain/repositories/job/IJobWriteRepository'
import type { UpdateJobRequestDTO } from '../../../dtos/job/UpdateJobRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiJobWriteRepository } from '../../../../infrastructure/repositories/ApiJobWriteRepository'

export class UpdateJobCommand {
    constructor(private readonly repo: IJobWriteRepository) {}

    static create(): UpdateJobCommand {
        const client = new HttpApiClient()
        const repo   = new ApiJobWriteRepository(client)
        return new UpdateJobCommand(repo)
    }

    async execute(id: number, input: UpdateJobRequestDTO, accessToken: string): Promise<Job> {
        return this.repo.update(id, input, accessToken)
    }
}
