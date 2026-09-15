import type { TrackDTO } from '../../../application/dtos/TrackDTO'

// =============================================================================
// ISpotifyReadRepository
// getNowPlaying — GET /spotify/now-playing. Backend guarantees a 200 with a
// TrackDTO-shaped body even when nothing is playing or Spotify is
// unconfigured (isPlaying: false, empty strings) — a thrown error here means
// a genuine transport/backend failure, not "nothing playing".
//
// No domain entity/mapper here, matching IAnalyticsReadRepository's
// PageViewDTO/ProjectViewDTO — this is an external-system snapshot, not a
// CRUD entity owned by this portfolio, so the DTO is used directly.
// =============================================================================
export interface ISpotifyReadRepository {
  getNowPlaying(): Promise<TrackDTO>
}
