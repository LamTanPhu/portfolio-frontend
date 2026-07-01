// =============================================================================
// EducationDTO
// Returned from GET /about/education. Mirrors backend EducationDTO exactly.
// Dates are ISO 8601 strings on the wire — parsed to Date only in the mapper.
// =============================================================================
export interface EducationDTO {
    id:            number
    degreeName:    string
    instituteName: string
    instituteUrl:  string | null
    startedAt:     string
    endedAt:       string | null
    isCompleted:   boolean
}