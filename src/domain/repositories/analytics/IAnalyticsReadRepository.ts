import type { PageViewDTO } from '../../../application/dtos/PageViewDTO'

// =============================================================================
// IAnalyticsReadRepository
// Admin-only — GET /analytics/page-views. Separate from
// IAnalyticsWriteRepository (the public fire-and-forget tracking calls)
// since reading aggregated stats requires auth and the two have nothing
// else in common.
//
// Note: the backend only exposes aggregated *page* view counts. Project
// views (ProjectView) and resume downloads (ResumeDownload) are tracked
// (see IAnalyticsWriteRepository / TrackResumeDownloadCommand) but have no
// admin read endpoint yet — nothing to wire up here until one exists.
// =============================================================================
export interface IAnalyticsReadRepository {
    getPageViews(accessToken: string): Promise<PageViewDTO[]>
}
