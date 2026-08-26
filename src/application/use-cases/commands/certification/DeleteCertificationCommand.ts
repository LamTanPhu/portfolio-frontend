import type { ICertificationWriteRepository } from '../../../../domain/repositories/certification/ICertificationWriteRepository'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiCertificationWriteRepository } from '../../../../infrastructure/repositories/ApiCertificationWriteRepository'

export class DeleteCertificationCommand {
    constructor(private readonly repo: ICertificationWriteRepository) {}

    static create(): DeleteCertificationCommand {
        const client = new HttpApiClient()
        const repo   = new ApiCertificationWriteRepository(client)
        return new DeleteCertificationCommand(repo)
    }

    async execute(id: number, accessToken: string): Promise<void> {
        await this.repo.delete(id, accessToken)
    }
}
