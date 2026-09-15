import type { ISpotifyReadRepository } from '../../../../domain/repositories/spotify/ISpotifyReadRepository'
import type { TrackDTO } from '../../../dtos/TrackDTO'
import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiSpotifyRepository } from '../../../../infrastructure/repositories/ApiSpotifyRepository'

// =============================================================================
// GetNowPlayingQuery
// Fetches currently playing Spotify track from the backend cache.
// Client-callable — see TrackResumeDownloadCommand/GetPageViewsQuery for the
// same static create() pattern. Called on an interval from useNowPlaying,
// not from a Server Component, so there is no separate loadX.ts wrapper.
// Plain passthrough — no fallback/error-swallowing here, see
// ApiSpotifyRepository's comment on why that lives in the presentation layer.
// =============================================================================
export class GetNowPlayingQuery {
  constructor(private readonly repo: ISpotifyReadRepository) {}

  static create(): GetNowPlayingQuery {
    const client = new HttpApiClient()
    const repo   = new ApiSpotifyRepository(client)
    return new GetNowPlayingQuery(repo)
  }

  async execute(): Promise<TrackDTO> {
    return this.repo.getNowPlaying()
  }
}
