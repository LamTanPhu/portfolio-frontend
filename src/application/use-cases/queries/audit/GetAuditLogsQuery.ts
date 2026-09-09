import type { IAuditReadRepository } from '../../../../domain/repositories/audit/IAuditReadRepository'
import type { AuditLogPageDTO } from '../../../dtos/audit/AuditLogDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiAuditRepository } from '../../../../infrastructure/repositories/ApiAuditRepository'

// =============================================================================
// GetAuditLogsQuery
// Admin-only, cursor-paginated. Client-callable — needs the access token
// held in AuthContext.
// =============================================================================
export class GetAuditLogsQuery {
    constructor(private readonly repo: IAuditReadRepository) {}

    static create(): GetAuditLogsQuery {
        const client = new HttpApiClient()
        const repo   = new ApiAuditRepository(client)
        return new GetAuditLogsQuery(repo)
    }

    async execute(accessToken: string, cursor?: number, limit?: number): Promise<AuditLogPageDTO> {
        return this.repo.findPaginated(accessToken, cursor, limit)
    }
}
