// =============================================================================
// UpdateEducationRequestDTO — mirrors backend UpdateEducationDto. Dates
// travel as ISO date strings. All fields optional — PATCH semantics.
// =============================================================================
export interface UpdateEducationRequestDTO {
    degreeName?:     string
    instituteName?:  string
    instituteUrl?:   string | null
    startedAt?:      string
    endedAt?:        string | null
    isCompleted?:    boolean
    isPublic?:       boolean
}
