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
    // The backend's blog responses do NOT include updatedAt today (list or detail).
    // Optional so the frontend works either way, and lights up if the backend adds it.
    updatedAt?:  string
}