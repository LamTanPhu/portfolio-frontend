import type { TrackDTO } from '../../application/dtos/TrackDTO'
import type { IApiClient } from '../../application/ports/IApiClient'
import type { ISpotifyReadRepository } from '../../domain/repositories/spotify/ISpotifyReadRepository'

// =============================================================================
// ApiSpotifyRepository
// Implements ISpotifyReadRepository using the backend REST API.
//
// getNowPlaying — GET /spotify/now-playing. Plain passthrough, no error
// swallowing here — matches every other read repository's convention (see
// ApiProjectRepository's own comment on the same point). "Fail silently"
// is a presentation-layer UX choice for this specific decorative widget,
// not an infrastructure-layer contract, so it lives in useNowPlaying
// instead of here. revalidate: 0 — this is polled client-side on its own
// interval, so it should never ride Next.js's ISR cache.
// =============================================================================
export class ApiSpotifyRepository implements ISpotifyReadRepository {
  constructor(private readonly client: IApiClient) {}

  async getNowPlaying(): Promise<TrackDTO> {
    return this.client.get<TrackDTO>('/spotify/now-playing', 0)
  }
}
