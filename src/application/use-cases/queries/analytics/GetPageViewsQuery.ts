import type { IAnalyticsReadRepository } from '../../../../domain/repositories/analytics/IAnalyticsReadRepository'
import type { PageViewDTO } from '../../../dtos/PageViewDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiAnalyticsRepository } from '../../../../infrastructure/repositories/ApiAnalyticsRepository'

// =============================================================================
// GetPageViewsQuery
// Admin-only. Client-callable — needs the access token held in AuthContext.
// =============================================================================
export class GetPageViewsQuery {
    constructor(private readonly repo: IAnalyticsReadRepository) {}

    static create(): GetPageViewsQuery {
        const client = new HttpApiClient()
        const repo   = new ApiAnalyticsRepository(client)
        return new GetPageViewsQuery(repo)
    }

    async execute(accessToken: string): Promise<PageViewDTO[]> {
        return this.repo.getPageViews(accessToken)
    }
}
