import type { Project } from '../../../../domain/entities/Project'
import type { IProjectWriteRepository } from '../../../../domain/repositories/project/IProjectWriteRepository'
import type { CreateProjectRequestDTO } from '../../../dtos/project/ProjectRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiProjectWriteRepository } from '../../../../infrastructure/repositories/ApiProjectWriteRepository'

export class CreateProjectCommand {
    constructor(private readonly repo: IProjectWriteRepository) {}

    static create(): CreateProjectCommand {
        const client = new HttpApiClient()
        const repo   = new ApiProjectWriteRepository(client)
        return new CreateProjectCommand(repo)
    }

    async execute(input: CreateProjectRequestDTO, accessToken: string): Promise<Project> {
        return this.repo.create(input, accessToken)
    }
}
