import type { IAnalyticsReadRepository } from '../../../../domain/repositories/analytics/IAnalyticsReadRepository'
import type { ProjectViewDTO } from '../../../dtos/ProjectViewDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiAnalyticsRepository } from '../../../../infrastructure/repositories/ApiAnalyticsRepository'

// =============================================================================
// GetProjectViewsQuery
// Admin-only. Client-callable — needs the access token held in AuthContext.
// =============================================================================
export class GetProjectViewsQuery {
    constructor(private readonly repo: IAnalyticsReadRepository) {}

    static create(): GetProjectViewsQuery {
        const client = new HttpApiClient()
        const repo   = new ApiAnalyticsRepository(client)
        return new GetProjectViewsQuery(repo)
    }

    async execute(projectId: number, accessToken: string): Promise<ProjectViewDTO> {
        return this.repo.getProjectViews(projectId, accessToken)
    }
}
