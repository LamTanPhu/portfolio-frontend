'use client'
import { Volume2, VolumeX } from 'lucide-react'
import { useAmbientAudio } from '../context/AmbientAudioContext'

// =============================================================================
// AmbientAudioControl — Atom
// Mute toggle + volume slider for the background ambient track (see
// AmbientAudioContext). Purely a control surface — all playback state and
// the <audio> element itself live in the provider, not here.
// =============================================================================
export function AmbientAudioControl() {
  const { volume, isMuted, setVolume, toggleMute } = useAmbientAudio()

  return (
    <div className="flex items-center gap-1.5 shrink-0">
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
