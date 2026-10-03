// @vitest-environment jsdom
import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AmbientAudioProvider, useAmbientAudio } from './AmbientAudioContext'

// jsdom doesn't implement media playback.
beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    localStorage.clear()
})

const wrapper = ({ children }: { children: ReactNode }) => <AmbientAudioProvider>{children}</AmbientAudioProvider>

describe('useAmbientAudio outside a provider', () => {
    // Regression test for the /_global-error build crash: error shells replace
    // the root layout, so chrome like the status bar renders with no provider.
    it('returns an inert value instead of throwing', () => {
        const { result } = renderHook(() => useAmbientAudio())

        expect(result.current.tracks).toEqual([])
        expect(result.current.isPlaying).toBe(false)
        expect(result.current.isMuted).toBe(true)
    })

    it('exposes controls that are safe no-ops', () => {
        const { result } = renderHook(() => useAmbientAudio())

        expect(() => {
            result.current.togglePlayPause()
            result.current.toggleMute()
            result.current.setVolume(1)
            result.current.selectTrack(2)
        }).not.toThrow()
        expect(result.current.isPlaying).toBe(false)
    })
})

describe('AmbientAudioProvider', () => {
    it('derives readable track titles from file names', () => {
        const { result } = renderHook(() => useAmbientAudio(), { wrapper })

        expect(result.current.tracks.map((t) => t.title)).toEqual(['Lofi Coffee Shop', 'Rain On Window', 'Ambient 3'])
    })

    it('renders an audio element for the current track and its children', () => {
        const { container } = render(
            <AmbientAudioProvider>
                <p>child</p>
            </AmbientAudioProvider>,
        )

        expect(screen.getByText('child')).toBeInTheDocument()
        expect(container.querySelector('audio')).toBeInTheDocument()
    })

    it('starts playing at the default 40% volume', () => {
        const { result } = renderHook(() => useAmbientAudio(), { wrapper })

        expect(result.current.isPlaying).toBe(true)
        expect(result.current.volume).toBe(0.4)
    })

    it('togglePlayPause pauses, then resumes', () => {
        const { result } = renderHook(() => useAmbientAudio(), { wrapper })

        act(() => result.current.togglePlayPause())
        expect(result.current.isPlaying).toBe(false)
        expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()

        act(() => result.current.togglePlayPause())
        expect(result.current.isPlaying).toBe(true)
    })

    it('selectTrack jumps to that track and starts playback even if paused', () => {
        const { result } = renderHook(() => useAmbientAudio(), { wrapper })
        act(() => result.current.togglePlayPause())

        act(() => result.current.selectTrack(2))

        expect(result.current.currentIndex).toBe(2)
        expect(result.current.isPlaying).toBe(true)
    })

    it('toggleMute flips the muted flag', () => {
        const { result } = renderHook(() => useAmbientAudio(), { wrapper })
        const initial = result.current.isMuted

        act(() => result.current.toggleMute())

        expect(result.current.isMuted).toBe(!initial)
    })

    it('raising the volume above zero while muted unmutes', () => {
        const { result } = renderHook(() => useAmbientAudio(), { wrapper })
        act(() => { if (!result.current.isMuted) result.current.toggleMute() })
        expect(result.current.isMuted).toBe(true)

        act(() => result.current.setVolume(0.7))

        expect(result.current.volume).toBe(0.7)
        expect(result.current.isMuted).toBe(false)
    })

    it('setting the volume to zero does not unmute', () => {
        const { result } = renderHook(() => useAmbientAudio(), { wrapper })
        act(() => { if (!result.current.isMuted) result.current.toggleMute() })

        act(() => result.current.setVolume(0))

        expect(result.current.isMuted).toBe(true)
    })

    it('persists volume and mute preferences to localStorage', () => {
        const { result } = renderHook(() => useAmbientAudio(), { wrapper })

        act(() => result.current.setVolume(0.25))

        expect(localStorage.getItem('ambient-audio-volume')).toBe('0.25')
        expect(localStorage.getItem('ambient-audio-muted')).toBe(String(result.current.isMuted))
    })

    it('restores remembered volume and mute state on mount', () => {
        localStorage.setItem('ambient-audio-volume', '0.9')
        localStorage.setItem('ambient-audio-muted', 'true')

        const { result } = renderHook(() => useAmbientAudio(), { wrapper })

        expect(result.current.volume).toBe(0.9)
        expect(result.current.isMuted).toBe(true)
    })

    it('retries playback on the first pointer interaction (browser autoplay unlock), once', async () => {
        renderHook(() => useAmbientAudio(), { wrapper })
        const play = HTMLMediaElement.prototype.play as ReturnType<typeof vi.fn>
        play.mockClear()

        await userEvent.click(document.body)
        const afterFirst = play.mock.calls.length
        await userEvent.click(document.body)

        expect(afterFirst).toBeGreaterThan(0)
        expect(play.mock.calls.length).toBe(afterFirst) // listener removed itself
    })
})
