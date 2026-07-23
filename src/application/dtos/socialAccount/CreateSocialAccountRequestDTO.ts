// =============================================================================
// CreateSocialAccountRequestDTO — mirrors backend CreateSocialAccountDto.
// =============================================================================
export interface CreateSocialAccountRequestDTO {
    name:      string
    url:       string
    imageUrl?: string | null
    isPublic?: boolean
}