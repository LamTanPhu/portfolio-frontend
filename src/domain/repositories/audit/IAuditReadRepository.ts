import type { AuditLogPageDTO } from '../../../application/dtos/audit/AuditLogDTO'

// =============================================================================
// IAuditReadRepository
// Admin-only, read-only — no write interface exists because entries are
// created exclusively by the backend's AuditLogInterceptor, never by a
// client request (see backend AuditController's file comment).
// =============================================================================
export interface IAuditReadRepository {
    findPaginated(accessToken: string, cursor?: number, limit?: number): Promise<AuditLogPageDTO>
}
