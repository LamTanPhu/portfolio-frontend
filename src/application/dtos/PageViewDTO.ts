// =============================================================================
// PageViewDTO
// Output shape for analytics page view data. Mirrors backend PageViewDTO.
// Admin-only — GET /analytics/page-views.
// =============================================================================
export interface PageViewDTO {
    route:        string
    count:        number
    lastViewedAt: string
}
