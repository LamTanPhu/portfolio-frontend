import type { TrackDTO } from '../../../dtos/TrackDTO'

// =============================================================================
// GetNowPlayingQuery
// Fetches currently playing Spotify track from backend cache.
// =============================================================================
export class GetNowPlayingQuery {
  constructor(
    private readonly apiUrl: string,
  ) {}

  async execute(): Promise<TrackDTO> {
    const res = await fetch(`${this.apiUrl}/spotify/now-playing`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) {
      return { isPlaying: false, title: '', artist: '', albumArt: '', songUrl: '' }
    }
    return res.json() as Promise<TrackDTO>
  }
}
