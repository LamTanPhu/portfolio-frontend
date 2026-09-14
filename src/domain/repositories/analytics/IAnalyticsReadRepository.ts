import type { PageViewDTO } from '../../../application/dtos/PageViewDTO'
import type { ProjectViewDTO } from '../../../application/dtos/ProjectViewDTO'

// =============================================================================
// IAnalyticsReadRepository
// Admin-only — GET /analytics/page-views, GET /analytics/project-views/:id.
// Separate from IAnalyticsWriteRepository (the public fire-and-forget
// tracking calls) since reading aggregated stats requires auth and the two
// have nothing else in common.
//
// Note: resume downloads (ResumeDownload) are tracked (see
// IAnalyticsWriteRepository / TrackResumeDownloadCommand) but still have no
// admin read endpoint — nothing to wire up here until one exists.
// =============================================================================
export interface IAnalyticsReadRepository {
    getPageViews(accessToken: string): Promise<PageViewDTO[]>
    getProjectViews(projectId: number, accessToken: string): Promise<ProjectViewDTO>
}
