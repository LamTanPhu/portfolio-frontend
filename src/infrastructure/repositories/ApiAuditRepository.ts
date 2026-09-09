import type { AuditLogPageDTO } from '../../application/dtos/audit/AuditLogDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { IAuditReadRepository } from '../../domain/repositories/audit/IAuditReadRepository'

// =============================================================================
// ApiAuditRepository
// findPaginated — GET /audit?cursor=&limit=  (admin only)
// =============================================================================
export class ApiAuditRepository implements IAuditReadRepository {
    constructor(private readonly client: IApiClient) {}

    async findPaginated(accessToken: string, cursor?: number, limit?: number): Promise<AuditLogPageDTO> {
        const params = new URLSearchParams()
        if (cursor !== undefined) params.set('cursor', String(cursor))
        if (limit !== undefined) params.set('limit', String(limit))
        const query = params.toString()

        return this.client.get<AuditLogPageDTO>(`/audit${query ? `?${query}` : ''}`, 0, { accessToken })
    }
}
