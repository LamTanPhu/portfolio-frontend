// =============================================================================
// Write-side request DTOs — mirror backend CreateProjectDto / UpdateProjectDto.
// slug is server-generated from name — never sent by the client.
// =============================================================================
export interface CreateProjectRequestDTO {
  name:          string
  description:   string
  techStack:     string[]
  isOpenSource:  boolean
  isPublished?:  boolean
  repoUrl?:      string | null
  liveUrl?:      string | null
  thumbnailUrl?: string | null
}

export interface UpdateProjectRequestDTO {
  name?:          string
  description?:   string
  techStack?:     string[]
  isOpenSource?:  boolean
  isPublished?:   boolean
  repoUrl?:       string | null
  liveUrl?:       string | null
  thumbnailUrl?:  string | null
}
