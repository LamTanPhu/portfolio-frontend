import type { IAnalyticsWriteRepository } from '../../domain/repositories/analytics/IAnalyticsWriteRepository'
import type { IApiClient } from '../../application/ports/IApiClient'

// =============================================================================
// ApiAnalyticsRepository
// trackPageView    — POST /analytics/page-view       { route }
// trackProjectView — POST /analytics/project-view/:id
//
// Both swallow errors — a tracking ping failing (network blip, ad blocker,
// backend hiccup) must never surface to the visitor or break the page. This
// mirrors the backend's own framing of these as "fire-and-forget" endpoints.
// =============================================================================
export class ApiAnalyticsRepository implements IAnalyticsWriteRepository {
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
}