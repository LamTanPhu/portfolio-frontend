'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AMBIENT_AUDIO_URL } from '@/lib/constants'

// =============================================================================
// AmbientAudioContext
// Decorative background music — entirely separate from the Spotify widget,
// which only ever displays metadata and never sends visitors any audio.
//
// Starts autoplaying muted on load (browsers always allow autoplay when
// muted — no gesture required), at a low default volume. Unmuting is a real
// click, so it stays fully compliant with autoplay policy while still
// feeling "already there, just quiet" rather than "click to start music".
//
// Lives in app/layout.tsx (the one layout that never remounts between
// client-side navigations — see loading.tsx's own comment on why every page
// otherwise composes its own VSCodeLayout), so playback position and state
// survive route changes instead of restarting on every page.
// =============================================================================

const VOLUME_STORAGE_KEY = 'ambient-audio-volume'
const MUTED_STORAGE_KEY  = 'ambient-audio-muted'
const DEFAULT_VOLUME     = 0.15

interface AmbientAudioContextValue {
  volume:  number
  isMuted: boolean
  setVolume:  (v: number) => void
  toggleMute: () => void
}

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(null)

export function AmbientAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME)
  const [isMuted, setIsMuted]    = useState(true)

  // Read remembered preference once, client-side only — localStorage
  // doesn't exist during SSR. Deliberately done after mount rather than in
  // a useState lazy initializer: reading localStorage synchronously during
  // the client's hydration render (window exists there, unlike on the
  // server) would make that first render disagree with what the server
  // sent, triggering a hydration mismatch. Rendering with the SSR-safe
  // defaults first and correcting after mount avoids that at the cost of
  // one harmless post-hydration update — the standard fix, not the
  // "manually syncing derived state" case react-hooks/set-state-in-effect
  // is meant to flag.
  useEffect(() => {
    const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY)
    const storedMuted  = localStorage.getItem(MUTED_STORAGE_KEY)
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Belt-and-suspenders alongside the autoPlay attribute — some browsers
  // still want an explicit .play() call for elements mounted via a ref.
  // Muted autoplay is universally allowed, so this never gets rejected;
  // the catch is only there in case a browser surprises us anyway.
  useEffect(() => {
    audioRef.current?.play().catch(() => {})
  }, [])

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
    <AmbientAudioContext.Provider value={{ volume, isMuted, setVolume, toggleMute }}>
      <audio ref={audioRef} src={AMBIENT_AUDIO_URL} loop autoPlay muted playsInline />
      {children}
    </AmbientAudioContext.Provider>
  )
}

export function useAmbientAudio(): AmbientAudioContextValue {
  const ctx = useContext(AmbientAudioContext)
  if (!ctx) throw new Error('useAmbientAudio must be used within AmbientAudioProvider')
  return ctx
}
