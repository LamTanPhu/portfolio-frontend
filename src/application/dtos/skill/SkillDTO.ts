export interface SkillDTO {
  id: number; name: string; imageUrl: string | null; category: string;
}
// =============================================================================
// Write-side request DTOs — mirror backend CreateSkillDto / UpdateSkillDto.
// category uses the same string union as SkillCategory — kept as `string`
// here (wire-level DTO) so this file has no dependency on the domain layer;
// SkillMapper/callers narrow it via SkillCategory.
// =============================================================================
export interface CreateSkillRequestDTO {
  name:      string
  imageUrl?: string | null
  category:  string
  isPublic?: boolean
}

export interface UpdateSkillRequestDTO {
  name?:      string
  imageUrl?:  string | null
  category?:  string
  isPublic?:  boolean
}