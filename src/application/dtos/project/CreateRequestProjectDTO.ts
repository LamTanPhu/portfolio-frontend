// =============================================================================
// CreateProjectRequestDTO — mirrors backend CreateProjectDto.
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