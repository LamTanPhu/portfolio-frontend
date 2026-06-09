// =============================================================================
// BlogSummaryDTO — returned by GET /api/blogs (list)
// No content field — backend returns excerpts only for list views.
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
}

// =============================================================================
// BlogDetailDTO — returned by GET /api/blogs/:slug (single post)
// Extends summary with full content and updatedAt.
// =============================================================================
export interface BlogDetailDTO extends BlogSummaryDTO {
  content:   string
  updatedAt: string
}