import type { IAnalyticsWriteRepository } from '../../domain/repositories/analytics/IAnalyticsWriteRepository'
import type { IAnalyticsReadRepository } from '../../domain/repositories/analytics/IAnalyticsReadRepository'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { PageViewDTO } from '../../application/dtos/PageViewDTO'

// =============================================================================
// ApiAnalyticsRepository
// trackPageView       — POST /analytics/page-view          { route }
// trackProjectView    — POST /analytics/project-view/:id
// trackResumeDownload — POST /analytics/resume-download
// getPageViews        — GET  /analytics/page-views          (admin only)
//
// The three track* methods swallow errors — a tracking ping failing
// (network blip, ad blocker, backend hiccup) must never surface to the
// visitor or break the page. This mirrors the backend's own framing of
// these as "fire-and-forget" endpoints. getPageViews is admin-only reading
// of real data, so it does NOT swallow errors — a failed fetch there should
// surface to the admin UI like any other admin query.
// =============================================================================
export class ApiAnalyticsRepository implements IAnalyticsWriteRepository, IAnalyticsReadRepository {
    constructor(private readonly client: IApiClient) {}

    async trackPageView(route: string): Promise<void> {
        try {
            await this.client.post('/analytics/page-view', { route })
        } catch {
            // best-effort — never block or throw on tracking failure
        }
    }

    async trackProjectView(projectId: number): Promise<void> {
        try {
            await this.client.post(`/analytics/project-view/${projectId}`, {})
        } catch {
            // best-effort — never block or throw on tracking failure
        }
    }

    async trackResumeDownload(): Promise<void> {
        try {
            await this.client.post('/analytics/resume-download', {})
        } catch {
            // best-effort — never block or throw on tracking failure
        }
    }

    async getPageViews(accessToken: string): Promise<PageViewDTO[]> {
        return this.client.get<PageViewDTO[]>('/analytics/page-views', 0, { accessToken })
    }
}