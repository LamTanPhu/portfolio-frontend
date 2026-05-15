// =============================================================================
// UserProfileDTO — Portfolio owner public profile
// =============================================================================
export interface UserProfileDTO {
  id:        number
  firstname: string
  lastname:  string
  email:     string
  aboutme:   string | null
  lastLogin: string | null
}
