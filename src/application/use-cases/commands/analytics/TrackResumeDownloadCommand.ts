import type { IAnalyticsWriteRepository } from '../../../../domain/repositories/analytics/IAnalyticsWriteRepository'
import { HttpApiClient }         from '../../../../infrastructure/api/HttpApiClient'
import { ApiAnalyticsRepository } from '../../../../infrastructure/repositories/ApiAnalyticsRepository'

// =============================================================================
// TrackResumeDownloadCommand
// Fire-and-forget — see TrackPageViewCommand for the same rationale on
// error handling and client-callability.
// =============================================================================
export class TrackResumeDownloadCommand {
    constructor(private readonly repo: IAnalyticsWriteRepository) {}

    static create(): TrackResumeDownloadCommand {
        const client = new HttpApiClient()
        const repo   = new ApiAnalyticsRepository(client)
        return new TrackResumeDownloadCommand(repo)
    }

    async execute(): Promise<void> {
        await this.repo.trackResumeDownload()
    }
}
