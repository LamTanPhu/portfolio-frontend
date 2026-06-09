// =============================================================================
// BlogSummary — lightweight projection for list views.
// No content — avoids loading full post body unnecessarily.
// =============================================================================
export class BlogSummary {
  constructor(
    public readonly id:          number,
    public readonly title:       string,
    public readonly slug:        string,
    public readonly excerpt:     string | null,
    public readonly tags:        string[],
    public readonly isPublished: boolean,
    public readonly publishedAt: Date | null,
    public readonly createdAt:   Date,
  ) {}
}

// =============================================================================
// Blog — full aggregate for detail views.
// Includes content and updatedAt — only loaded when viewing a single post.
// =============================================================================
export class Blog {
  constructor(
    public readonly id:          number,
    public readonly title:       string,
    public readonly slug:        string,
    public readonly content:     string,
    public readonly excerpt:     string | null,
    public readonly tags:        string[],
    public readonly isPublished: boolean,
    public readonly publishedAt: Date | null,
    public readonly createdAt:   Date,
    public readonly updatedAt:   Date,
  ) {}
}