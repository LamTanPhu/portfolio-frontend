// =============================================================================
// ContactMessageDTO
// Admin-only shape — includes IP and browser info for spam analysis.
// Never exposed on the public POST /contact endpoint.
// Mirrors backend ContactMessageDTO exactly.
// =============================================================================
export interface ContactMessageDTO {
    id:          number
    name:        string
    email:       string
    message:     string
    ipAddress:   string
    browserInfo: string | null
    createdAt:   string
}

// =============================================================================
// ContactPageDTO
// Cursor-paginated response for GET /contact (admin).
// =============================================================================
export interface ContactPageDTO {
    items:      ContactMessageDTO[]
    nextCursor: number | null
    total:      number
}
