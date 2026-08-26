// =============================================================================
// UpdateCertificationRequestDTO — mirrors backend UpdateCertificationDto.
// All fields optional — PATCH semantics, only provided fields updated.
// =============================================================================
export interface UpdateCertificationRequestDTO {
    name?:        string
    url?:         string
    startDate?:   string
    endDate?:     string | null
    isPublished?: boolean
}
