import type { IAnalyticsWriteRepository } from '../../../../domain/repositories/analytics/IAnalyticsWriteRepository'
import { HttpApiClient }         from '../../../../infrastructure/api/HttpApiClient'
import { ApiAnalyticsRepository } from '../../../../infrastructure/repositories/ApiAnalyticsRepository'

// =============================================================================
// TrackProjectViewCommand
// Fire-and-forget — see TrackPageViewCommand for the same rationale on
// error handling and client-callability.
// =============================================================================
export class TrackProjectViewCommand {
    constructor(private readonly repo: IAnalyticsWriteRepository) {}

    static create(): TrackProjectViewCommand {
        const client = new HttpApiClient()
        const repo   = new ApiAnalyticsRepository(client)
        return new TrackProjectViewCommand(repo)
    }

    async execute(projectId: number): Promise<void> {
        await this.repo.trackProjectView(projectId)
    }
}