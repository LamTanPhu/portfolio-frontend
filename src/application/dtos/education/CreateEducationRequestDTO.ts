// =============================================================================
// CreateEducationRequestDTO — mirrors backend CreateEducationDto. Dates
// travel as ISO date strings.
// =============================================================================
export interface CreateEducationRequestDTO {
    degreeName:     string
    instituteName:  string
    instituteUrl?:  string | null
    startedAt:      string
    endedAt?:       string | null
    isCompleted?:   boolean
}