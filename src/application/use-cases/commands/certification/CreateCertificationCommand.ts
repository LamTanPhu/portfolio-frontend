import type { Certification } from '../../../../domain/entities/Certification'
import type { ICertificationWriteRepository } from '../../../../domain/repositories/certification/ICertificationWriteRepository'
import type { CreateCertificationRequestDTO } from '../../../dtos/certification/CreateCertificationRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiCertificationWriteRepository } from '../../../../infrastructure/repositories/ApiCertificationWriteRepository'

export class CreateCertificationCommand {
    constructor(private readonly repo: ICertificationWriteRepository) {}

    static create(): CreateCertificationCommand {
        const client = new HttpApiClient()
        const repo   = new ApiCertificationWriteRepository(client)
        return new CreateCertificationCommand(repo)
    }

    async execute(input: CreateCertificationRequestDTO, accessToken: string): Promise<Certification> {
        return this.repo.create(input, accessToken)
    }
}
