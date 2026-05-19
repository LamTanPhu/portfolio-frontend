'use client'
import { useNowPlaying } from '../hooks/useNowPlaying'

export function NowPlaying() {
  const { track } = useNowPlaying()
  if (!track?.isPlaying) {
    return <span className="font-mono text-[11px] text-[#858585]">♪ Not playing</span>
  }
  return (
    <a href={track.songUrl} target="_blank" rel="noopener noreferrer"
        className="font-mono text-[11px] text-[#858585] hover:text-[#cccccc] transition-colors">
      ♪ {track.title} — {track.artist}
    </a>
  )
}
