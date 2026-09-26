'use client'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useAmbientAudio } from '../context/AmbientAudioContext'

// =============================================================================
// AmbientAudioControl — Atom
// Transport (play/pause), track picker, mute toggle, and volume slider for
// the background ambient playlist (see AmbientAudioContext). Purely a
// control surface — all playback state and the <audio> element itself live
// in the provider, not here.
// =============================================================================
export function AmbientAudioControl() {
  const {
    tracks, currentIndex, isPlaying, volume, isMuted,
    togglePlayPause, selectTrack, setVolume, toggleMute,
  } = useAmbientAudio()

  const [pickerOpen, setPickerOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={togglePlayPause}
        title={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}
        aria-label={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}
        className="flex items-center justify-center w-5 h-5 text-(--text-muted) hover:text-(--text-primary) transition-colors duration-150"
      >
        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
      </button>

      <button
        type="button"
        onClick={() => setPickerOpen((open) => !open)}
        title="Choose ambient track"
        aria-label="Choose ambient track"
        aria-expanded={pickerOpen}
        className="hidden md:flex items-center gap-0.5 max-w-24 text-(--text-muted) hover:text-(--text-primary) transition-colors duration-150"
      >
        <span className="truncate">{tracks[currentIndex]?.title}</span>
        <ChevronDown size={11} className="shrink-0" />
      </button>

      {pickerOpen && (
        <div className="absolute bottom-full right-0 mb-1 w-40 border border-(--border-muted) bg-(--bg-sidebar) shadow-lg z-10">
          {tracks.map((track, index) => (
            <button
              key={track.url}
              type="button"
              onClick={() => {
                selectTrack(index)
                setPickerOpen(false)
              }}
              className={`w-full text-left px-2 py-1.5 truncate hover:bg-(--bg-elevated) ${
                index === currentIndex ? 'text-(--accent-teal)' : 'text-(--text-muted)'
              }`}
            >
              {track.title}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={toggleMute}
        title={isMuted ? 'Unmute ambient audio' : 'Mute ambient audio'}
        aria-label={isMuted ? 'Unmute ambient audio' : 'Mute ambient audio'}
        className="flex items-center justify-center w-5 h-5 text-(--text-muted) hover:text-(--text-primary) transition-colors duration-150"
      >
        {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Ambient audio volume"
        className="hidden sm:block w-14 accent-(--accent-teal) cursor-pointer"
      />
    </div>
  )
}
