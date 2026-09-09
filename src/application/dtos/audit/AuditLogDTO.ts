// =============================================================================
// AuditLogDTO
// Admin-only — GET /audit. Mirrors backend AuditLogDTO exactly. A recent-
// activity trail for admin write actions (create/update/delete) — see
// backend's AuditLog model comment: short retention (47 days), no
// before/after diff, "what happened recently" rather than a permanent
// accountability record.
// =============================================================================
export interface AuditLogDTO {
    id:         number
    actorId:    number | null
    method:     string
    route:      string
    entityType: string
    entityId:   string | null
    ipAddress:  string | null
    statusCode: number
    createdAt:  string
}

// =============================================================================
// AuditLogPageDTO
// Cursor-paginated response for GET /audit (admin).
// =============================================================================
export interface AuditLogPageDTO {
    items:      AuditLogDTO[]
    nextCursor: number | null
    total:      number
}
