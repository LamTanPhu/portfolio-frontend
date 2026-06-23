'use client'
import { useEffect, useState } from 'react'
import type { TrackDTO } from '../../application/dtos/TrackDTO'
import { API_URL } from '@/lib/constants'

// =============================================================================
// useNowPlaying
// Polls Spotify now-playing endpoint every 30 seconds.
// Cache handled server-side — this just polls the cached result.
// =============================================================================
export function useNowPlaying() {
  const [track, setTrack] = useState<TrackDTO | null>(null)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await window.fetch(`${API_URL}/spotify/now-playing`)
        if (res.ok) setTrack(await res.json() as TrackDTO)
      } catch {
        // Spotify unavailable — fail silently
      }
    }

    fetch()
    const interval = setInterval(fetch, 30_000)
    return () => clearInterval(interval)
  }, [])

  return { track }
}