// =============================================================================
// CreateSkillRequestDTO — mirrors backend CreateSkillDto. category uses the
// same string union as SkillCategory — kept as `string` here (wire-level DTO)
// so this file has no dependency on the domain layer; SkillMapper/callers
// narrow it via SkillCategory.
// =============================================================================
export interface CreateSkillRequestDTO {
    name:      string
    imageUrl?: string | null
    category:  string
    isPublic?: boolean
}