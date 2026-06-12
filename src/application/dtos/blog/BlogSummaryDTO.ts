// =============================================================================
// BlogSummaryDTO
// Returned from GET /blogs — list view only.
// No content field — use BlogDetailDTO for full post.
// =============================================================================
export interface BlogSummaryDTO {
    id:          number
    title:       string
    slug:        string
    excerpt:     string | null
    tags:        string[]
    isPublished: boolean
    publishedAt: string | null
    createdAt:   string
    updatedAt:   string
}