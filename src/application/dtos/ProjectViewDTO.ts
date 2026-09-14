// =============================================================================
// ProjectViewDTO
// Output shape for analytics project view data. Mirrors backend
// ProjectViewDTO. Admin-only — GET /analytics/project-views/:id.
//
// daily[].date is day-only (YYYY-MM-DD), ordered most-recent-first —
// ProjectView is a daily bucket (one row per project per day), so a full
// timestamp would imply precision that was never recorded.
// =============================================================================
export interface ProjectViewDTO {
  projectId:  number
  totalViews: number
  daily:      { date: string; count: number }[]
}
