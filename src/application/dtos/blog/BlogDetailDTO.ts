import type { BlogSummaryDTO } from './BlogSummaryDTO'

// =============================================================================
// BlogDetailDTO
// Returned from GET /blogs/:slug — full post view.
// Extends BlogSummaryDTO with content field.
// =============================================================================
export interface BlogDetailDTO extends BlogSummaryDTO {
    content: string
}