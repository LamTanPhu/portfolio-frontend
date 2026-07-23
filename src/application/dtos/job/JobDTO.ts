// =============================================================================
// JobDTO
// Returned from GET /about/jobs. Mirrors backend JobDTO exactly.
// Dates are ISO 8601 strings on the wire — parsed to Date only in the mapper.
// =============================================================================
export interface JobDTO {
    id:          number
    companyName: string
    role:        string
    startedAt:   string
    endedAt:     string | null
    isEnded:     boolean
}
