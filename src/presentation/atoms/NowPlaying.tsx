'use client'
import { useNowPlaying } from '../hooks/useNowPlaying'

// =============================================================================
// NowPlaying — Atom
// Polls Spotify now-playing via useNowPlaying hook.
// Shows "♪ Not playing" when nothing is on, or a link when playing.
// =============================================================================

export function NowPlaying() {
  const { track } = useNowPlaying()

  if (!track?.isPlaying) {
    return (
      <span className="font-mono text-[11px] text-(--text-muted)">
        ♪ Not playing
      </span>
    )
  }

  return (
    <a
      href={track.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`${track.title} — ${track.artist}`}
      className="font-mono text-[11px] text-(--text-muted) hover:text-(--text-primary) transition-colors duration-150"
    >
      ♪ {track.title} — {track.artist}
    </a>
  )
}