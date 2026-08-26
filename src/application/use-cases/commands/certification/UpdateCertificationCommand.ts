import type { Certification } from '../../../../domain/entities/Certification'
import type { ICertificationWriteRepository } from '../../../../domain/repositories/certification/ICertificationWriteRepository'
import type { UpdateCertificationRequestDTO } from '../../../dtos/certification/UpdateCertificationRequestDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiCertificationWriteRepository } from '../../../../infrastructure/repositories/ApiCertificationWriteRepository'

export class UpdateCertificationCommand {
    constructor(private readonly repo: ICertificationWriteRepository) {}

    static create(): UpdateCertificationCommand {
        const client = new HttpApiClient()
        const repo   = new ApiCertificationWriteRepository(client)
        return new UpdateCertificationCommand(repo)
    }

    async execute(id: number, input: UpdateCertificationRequestDTO, accessToken: string): Promise<Certification> {
        return this.repo.update(id, input, accessToken)
    }
}
