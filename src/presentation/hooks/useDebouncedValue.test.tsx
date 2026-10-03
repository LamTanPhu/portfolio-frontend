// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns the initial value immediately', () => {
        const { result } = renderHook(() => useDebouncedValue('a', 300))

        expect(result.current).toBe('a')
    })

    it('does not update until the delay has passed', () => {
        const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: 'a' } })

        rerender({ v: 'b' })
        act(() => { vi.advanceTimersByTime(299) })

        expect(result.current).toBe('a')
    })

    it('updates once the delay has passed', () => {
        const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: 'a' } })

        rerender({ v: 'b' })
        act(() => { vi.advanceTimersByTime(300) })

        expect(result.current).toBe('b')
    })

    it('restarts the timer on every change, so only the last value in a burst is emitted', () => {
        const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: 'a' } })

        rerender({ v: 'b' })
        act(() => { vi.advanceTimersByTime(200) })
        rerender({ v: 'c' })
        act(() => { vi.advanceTimersByTime(200) })
        expect(result.current).toBe('a') // 400ms in, but the timer restarted at 200ms

        act(() => { vi.advanceTimersByTime(100) })
        expect(result.current).toBe('c') // 'b' was never emitted
    })

    it('uses a 300ms delay by default', () => {
        const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v), { initialProps: { v: 'a' } })

        rerender({ v: 'b' })
        act(() => { vi.advanceTimersByTime(299) })
        expect(result.current).toBe('a')
        act(() => { vi.advanceTimersByTime(1) })
        expect(result.current).toBe('b')
    })

    it('does not fire a pending update after unmount', () => {
        const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
        const { rerender, unmount } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: 'a' } })

        rerender({ v: 'b' })
        unmount()

        expect(clearSpy).toHaveBeenCalled()
        expect(vi.getTimerCount()).toBe(0)
    })

    it('works with non-string values', () => {
        const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 100), { initialProps: { v: 1 } })

        rerender({ v: 2 })
        act(() => { vi.advanceTimersByTime(100) })

        expect(result.current).toBe(2)
    })
})
