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

// =============================================================================
// UpdateUserRequestDTO — mirrors backend UpdateUserDto.
// Email and password are intentionally excluded — not editable via this
// endpoint on the backend either.
// =============================================================================
export interface UpdateUserRequestDTO {
  firstname?: string
  lastname?:  string
  aboutme?:   string | null
}