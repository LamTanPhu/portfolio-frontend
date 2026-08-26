import type { Project } from '../../../../domain/entities/Project'
import type { IProjectWriteRepository } from '../../../../domain/repositories/project/IProjectWriteRepository'
import type { UpdateProjectRequestDTO } from '../../../dtos/project/ProjectRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiProjectWriteRepository } from '../../../../infrastructure/repositories/ApiProjectWriteRepository'

export class UpdateProjectCommand {
    constructor(private readonly repo: IProjectWriteRepository) {}

    static create(): UpdateProjectCommand {
        const client = new HttpApiClient()
        const repo   = new ApiProjectWriteRepository(client)
        return new UpdateProjectCommand(repo)
    }

    async execute(id: number, input: UpdateProjectRequestDTO, accessToken: string): Promise<Project> {
        return this.repo.update(id, input, accessToken)
    }
}
