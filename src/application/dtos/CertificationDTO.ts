// =============================================================================
// CertificationDTO
// Returned from GET /about/certifications. Mirrors backend CertificationDTO
// exactly. Dates are ISO 8601 strings on the wire — parsed to Date only in
// the mapper.
// =============================================================================
export interface CertificationDTO {
    id:        number
    name:      string
    url:       string
    startDate: string
    endDate:   string | null
}