// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TrackDTO } from '@/src/application/dtos/TrackDTO'
import { useNowPlaying } from './useNowPlaying'

const execute = vi.hoisted(() => vi.fn<() => Promise<TrackDTO>>())

vi.mock('@/src/application/use-cases/queries/analytics/GetNowPlayingQuery', () => ({
    GetNowPlayingQuery: { create: () => ({ execute }) },
}))

const track = (title: string): TrackDTO => ({ isPlaying: true, title, artist: 'Artist', albumArt: 'a.png', songUrl: 'https://s.example/1' })

// Lets pending promise callbacks run while fake timers are active.
const flush = () => act(async () => { await Promise.resolve() })

describe('useNowPlaying', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        execute.mockReset()
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('starts with no track and fetches immediately on mount', async () => {
        execute.mockResolvedValue(track('One'))

        const { result } = renderHook(() => useNowPlaying())
        expect(result.current.track).toBeNull()

        await flush()
        expect(execute).toHaveBeenCalledTimes(1)
        expect(result.current.track).toMatchObject({ title: 'One' })
    })

    it('polls again every 30 seconds', async () => {
        execute.mockResolvedValueOnce(track('One')).mockResolvedValueOnce(track('Two'))
        const { result } = renderHook(() => useNowPlaying())
        await flush()

        await act(async () => { await vi.advanceTimersByTimeAsync(29_999) })
        expect(execute).toHaveBeenCalledTimes(1)

        await act(async () => { await vi.advanceTimersByTimeAsync(1) })
        expect(execute).toHaveBeenCalledTimes(2)
        expect(result.current.track).toMatchObject({ title: 'Two' })
    })

    it('keeps the last known track when a later poll fails (decorative widget, no error UI)', async () => {
        execute.mockResolvedValueOnce(track('One')).mockRejectedValueOnce(new Error('backend down'))
        const { result } = renderHook(() => useNowPlaying())
        await flush()

        await act(async () => { await vi.advanceTimersByTimeAsync(30_000) })

        expect(result.current.track).toMatchObject({ title: 'One' })
    })

    it('stays null, without throwing, when the very first poll fails', async () => {
        execute.mockRejectedValue(new Error('backend down'))

        const { result } = renderHook(() => useNowPlaying())
        await flush()

        expect(result.current.track).toBeNull()
    })

    it('stops polling after unmount', async () => {
        execute.mockResolvedValue(track('One'))
        const { unmount } = renderHook(() => useNowPlaying())
        await flush()

        unmount()
        await vi.advanceTimersByTimeAsync(120_000)

        expect(execute).toHaveBeenCalledTimes(1)
    })

    it('ignores a response that arrives after unmount', async () => {
        let resolve!: (t: TrackDTO) => void
        execute.mockReturnValue(new Promise<TrackDTO>((r) => { resolve = r }))
        const { result, unmount } = renderHook(() => useNowPlaying())

        unmount()
        await act(async () => { resolve(track('Late')) })

        expect(result.current.track).toBeNull()
    })
})
