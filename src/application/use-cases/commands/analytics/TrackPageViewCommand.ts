import type { IAnalyticsWriteRepository } from '../../../../domain/repositories/analytics/IAnalyticsWriteRepository'
import { HttpApiClient }         from '../../../../infrastructure/api/HttpApiClient'
import { ApiAnalyticsRepository } from '../../../../infrastructure/repositories/ApiAnalyticsRepository'

// =============================================================================
// TrackPageViewCommand
// Fire-and-forget — resolves silently regardless of outcome (see
// ApiAnalyticsRepository). Safe to call from Client Components: unlike
// SubmitContactCommand, this performs no sensitive write and needs no
// Server Action — it's called directly from a useEffect on route change.
// =============================================================================
export class TrackPageViewCommand {
    constructor(private readonly repo: IAnalyticsWriteRepository) {}

    static create(): TrackPageViewCommand {
        const client = new HttpApiClient()
        const repo   = new ApiAnalyticsRepository(client)
        return new TrackPageViewCommand(repo)
    }

    async execute(route: string): Promise<void> {
        await this.repo.trackPageView(route)
    }
}