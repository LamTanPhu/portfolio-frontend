// =============================================================================
// ProjectSummaryDTO
// Returned from GET /projects — list view only.
// description is OMITTED — mirrors backend ProjectSummaryDTO exactly (not
// fetched/sent on list queries, saves bandwidth). Use ProjectDTO for the
// full single-item shape.
// =============================================================================
export interface ProjectSummaryDTO {
  id:           number
  name:         string
  slug:         string
  techStack:    string[]
  repoUrl:      string | null
  liveUrl:      string | null
  thumbnailUrl: string | null
  isPublished:  boolean
  isOpenSource: boolean
  createdAt:    string
  updatedAt:    string
}
