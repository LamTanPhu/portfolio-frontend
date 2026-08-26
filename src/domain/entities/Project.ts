// =============================================================================
// ProjectSummary — lightweight projection for list views.
// No description — avoids loading full project body unnecessarily. Mirrors
// domain/entities/Blog.ts's BlogSummary/Blog split.
// =============================================================================
export class ProjectSummary {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly techStack: string[],
    public readonly repoUrl: string | null,
    public readonly liveUrl: string | null,
    public readonly thumbnailUrl: string | null,
    public readonly isPublished: boolean,
    public readonly isOpenSource: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

// =============================================================================
// Project — full aggregate for detail views.
// Includes description — only loaded when viewing a single project.
// =============================================================================
export class Project {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly slug: string,
    public readonly techStack: string[],
    public readonly repoUrl: string | null,
    public readonly liveUrl: string | null,
    public readonly thumbnailUrl: string | null,
    public readonly isPublished: boolean,
    public readonly isOpenSource: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
