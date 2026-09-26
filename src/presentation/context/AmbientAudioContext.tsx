'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AMBIENT_TRACK_URLS } from '@/lib/constants'

// =============================================================================
// AmbientAudioContext
// Decorative background playlist — entirely separate from the Spotify
// widget, which only ever displays metadata and never sends visitors any
// audio.
//
// Starts autoplaying muted on load (browsers always allow autoplay when
// muted — no gesture required), shuffled across AMBIENT_TRACK_URLS, then
// unmutes at 40% the moment the visitor does anything at all on the page —
// any click or keypress, not specifically the mute button. That first-
// interaction unlock exists because browsers block audible autoplay
// outright, with or without a "muted by default" preference — there's no
// way to skip it, only to make it fire on the first interaction anywhere
// rather than requiring the visitor to find and click the speaker icon
// specifically. Loops endlessly: when a track ends, the next shuffled track
// plays automatically; when the shuffle queue empties, it reshuffles and
// keeps going, forever, until the visitor pauses.
//
// Lives in app/layout.tsx (the one layout that never remounts between
// client-side navigations — see loading.tsx's own comment on why every page
// otherwise composes its own VSCodeLayout), so playback survives route
// changes instead of restarting on every page.
// =============================================================================

const VOLUME_STORAGE_KEY = 'ambient-audio-volume'
const MUTED_STORAGE_KEY  = 'ambient-audio-muted'
const DEFAULT_VOLUME     = 0.4

export interface AmbientTrack {
  url:   string
  title: string
}

// Derives a display title from a file path — "/lofi-coffee-shop.mp3" becomes
// "Lofi Coffee Shop". Name the actual files descriptively; this is the only
// source for what the track picker shows.
function titleFromUrl(url: string): string {
  const fileName = url.split('/').pop() ?? url
  const withoutExtension = fileName.replace(/\.[^./]+$/, '')
  return withoutExtension
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

const TRACKS: AmbientTrack[] = AMBIENT_TRACK_URLS.map((url) => ({ url, title: titleFromUrl(url) }))

function shuffledIndices(): number[] {
  const indices = TRACKS.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

// A fresh shuffle of all tracks, nudged so the one that just finished isn't
// immediately repeated — every track still appears in the queue, just not
// necessarily first.
function nextQueue(justPlayed: number): number[] {
  const shuffled = shuffledIndices()
  if (shuffled.length > 1 && shuffled[0] === justPlayed) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }
  return shuffled
}

interface AmbientAudioContextValue {
  tracks:          AmbientTrack[]
  currentIndex:    number
  isPlaying:       boolean
  volume:          number
  isMuted:         boolean
  togglePlayPause: () => void
  selectTrack:     (index: number) => void
  setVolume:       (v: number) => void
  toggleMute:      () => void
}

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(null)

export function AmbientAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const queueRef  = useRef<number[]>([])

  // currentIndex starts at 0 for both server and the client's first
  // (hydration) render — shuffling during initial state would make
  // hydration disagree with what the server sent, same reasoning as
  // volume/isMuted below.
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying]       = useState(true)
  const [volume, setVolumeState]        = useState(DEFAULT_VOLUME)
  const [isMuted, setIsMuted]           = useState(false)

  // Client-only: pick the real starting track and restore the visitor's
  // remembered volume/mute preference. Deliberately after mount, not in a
  // useState lazy initializer — reading localStorage or calling
  // Math.random() during the client's hydration render (window/randomness
  // available there, unlike during SSR) would make that first render
  // disagree with what the server sent, triggering a hydration mismatch.
  // Rendering with SSR-safe defaults first and correcting after mount
  // avoids that at the cost of one harmless post-hydration update — the
  // standard fix, not the "manually syncing derived state" case
  // react-hooks/set-state-in-effect is meant to flag.
  useEffect(() => {
    queueRef.current = shuffledIndices()
    const first = queueRef.current.shift()
    if (first !== undefined) setCurrentIndex(first)

    const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY)
    const storedMuted  = localStorage.getItem(MUTED_STORAGE_KEY)
    if (storedVolume !== null) setVolumeState(Number(storedVolume))
    if (storedMuted !== null) setIsMuted(storedMuted === 'true')
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume))
  }, [volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted
    localStorage.setItem(MUTED_STORAGE_KEY, String(isMuted))
  }, [isMuted])

  // Keeps the element's actual play/pause state in sync with isPlaying —
  // covers both the transport button and advancing to a new track (changing
  // src resets playback, so it needs re-starting whenever isPlaying).
  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentIndex])

  // The initial autoplay attempt above runs unmuted (isMuted defaults to
  // false) with no user gesture yet, so browsers reject it — caught above,
  // silently. This retries .play() on the visitor's first click or keypress
  // anywhere on the page, which does count as a gesture, so it succeeds
  // then. Runs once; removes itself after firing.
  useEffect(() => {
    function unlock() {
      audioRef.current?.play().catch(() => {})
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  function advanceToNextTrack() {
    if (queueRef.current.length === 0) {
      queueRef.current = nextQueue(currentIndex)
    }
    const next = queueRef.current.shift()
    if (next !== undefined) setCurrentIndex(next)
  }

  function togglePlayPause() {
    setIsPlaying((p) => !p)
  }

  function selectTrack(index: number) {
    setCurrentIndex(index)
    setIsPlaying(true)
  }

  function setVolume(v: number) {
    setVolumeState(v)
    // Dragging the slider above zero is an unambiguous "I want sound" —
    // don't make the visitor also remember to hit the mute button.
    if (v > 0 && isMuted) setIsMuted(false)
  }

  function toggleMute() {
    setIsMuted((m) => !m)
  }

  return (
    <AmbientAudioContext.Provider
      value={{
        tracks: TRACKS, currentIndex, isPlaying, volume, isMuted,
        togglePlayPause, selectTrack, setVolume, toggleMute,
      }}
    >
      <audio
        ref={audioRef}
        src={TRACKS[currentIndex]?.url}
        onEnded={advanceToNextTrack}
        autoPlay
        muted
        playsInline
      />
      {children}
    </AmbientAudioContext.Provider>
  )
}

export function useAmbientAudio(): AmbientAudioContextValue {
  const ctx = useContext(AmbientAudioContext)
  if (!ctx) throw new Error('useAmbientAudio must be used within AmbientAudioProvider')
  return ctx
}
