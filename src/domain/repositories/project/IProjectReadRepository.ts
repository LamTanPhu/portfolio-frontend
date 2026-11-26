import type { Project, ProjectSummary } from '../../entities/Project'

// =============================================================================
// IProjectReadRepository
// findPublished   — published project summaries for list views (public)
// findBySlug      — one published project (public — the backend answers 404
//                   for an unpublished draft)
// findAllAdmin    — every project summary including drafts, admin-only
// findBySlugAdmin — one project by slug, draft or published, admin-only
// =============================================================================
export interface IProjectReadRepository {
  findPublished(): Promise<ProjectSummary[]>
  findBySlug(slug: string): Promise<Project | null>
  findAllAdmin(accessToken: string): Promise<ProjectSummary[]>
  findBySlugAdmin(slug: string, accessToken: string): Promise<Project | null>
}
