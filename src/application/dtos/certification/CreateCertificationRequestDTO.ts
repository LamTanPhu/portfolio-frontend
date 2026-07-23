// =============================================================================
// CreateCertificationRequestDTO — mirrors backend CreateCertificationDto.
// isPublished is write-only — the public/list response never returns it
// (matches backend CertificationDTO), so admin UIs must track publish state
// from what they last sent, not from the response.
// =============================================================================
export interface CreateCertificationRequestDTO {
    name:         string
    url:          string
    startDate:    string
    endDate?:     string | null
    isPublished?: boolean
}