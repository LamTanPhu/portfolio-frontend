// =============================================================================
// CreateJobRequestDTO — mirrors backend CreateJobDto. Dates travel as ISO
// date strings.
// =============================================================================
export interface CreateJobRequestDTO {
    companyName: string
    role:        string
    startedAt:   string
    endedAt?:    string | null
    isEnded?:    boolean
}