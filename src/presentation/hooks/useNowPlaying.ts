'use client'
import { useEffect, useState } from 'react'
import type { TrackDTO } from '../../application/dtos/TrackDTO'
import { GetNowPlayingQuery } from '../../application/use-cases/queries/analytics/GetNowPlayingQuery'

// =============================================================================
// useNowPlaying
// Polls Spotify now-playing endpoint every 30 seconds via GetNowPlayingQuery
// (repository-backed, same stack as every other read in this app — this
// used to bypass that with a raw fetch, see GetNowPlayingQuery's history).
// Cache handled server-side — this just polls the cached result.
//
// A failure here (real backend/network outage — see ApiSpotifyRepository's
// comment on why the backend itself never 4xx/5xx for "nothing playing")
// is swallowed on purpose: this is a decorative status-bar widget, so the
// UX policy is "keep the last known track, don't surface an error".
// =============================================================================
export function useNowPlaying() {
  const [track, setTrack] = useState<TrackDTO | null>(null)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const result = await GetNowPlayingQuery.create().execute()
        if (!cancelled) setTrack(result)
      } catch {
        // Spotify/backend unavailable — fail silently, keep last known state
      }
    }

    poll()
    const interval = setInterval(poll, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return { track }
}
