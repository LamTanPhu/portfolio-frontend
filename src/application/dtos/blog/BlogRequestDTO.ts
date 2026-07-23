// =============================================================================
// Write-side request DTOs — mirror backend CreateBlogDto / UpdateBlogDto.
// slug is server-generated from title — never sent by the client.
// publishedAt is server-set when isPublished flips to true — never sent.
// =============================================================================
export interface CreateBlogRequestDTO {
    title:        string
    content:      string
    excerpt?:     string | null
    tags?:        string[]
    isPublished?: boolean
}

export interface UpdateBlogRequestDTO {
    title?:       string
    content?:     string
    excerpt?:     string | null
    tags?:        string[]
    isPublished?: boolean
}