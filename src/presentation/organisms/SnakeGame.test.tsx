// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SnakeGame } from './SnakeGame'

// ── Test harness ────────────────────────────────────────────────────────────
// The board is 14×14, the snake starts at (4,7)(3,7)(2,7) heading right, and 10
// pieces of food are placed with Math.random(). Feeding the game a scripted
// "random" sequence makes every run fully deterministic.
const COLS = 14
const CELL = 24
const TICK = 140

const realRandom = Math.random
/** Scripts the 10 initial food positions; later calls (reset) fall back to real randomness. */
function placeFood(cells: Array<[number, number]>) {
    const queue = cells.flatMap(([x, y]) => [(x + 0.5) / COLS, (y + 0.5) / COLS])
    vi.spyOn(Math, 'random').mockImplementation(() => (queue.length ? queue.shift()! : realRandom()))
}
// Food 5..13 along the snake's row plus (0,7) after the wrap = a 10-tick win going straight.
const ROW_FOOD: Array<[number, number]> = [...Array.from({ length: 9 }, (_, i): [number, number] => [5 + i, 7]), [0, 7]]
// Three pieces ahead (to lengthen the snake) and seven out of the way along the top row.
const SIDE_FOOD: Array<[number, number]> = [[5, 7], [6, 7], [7, 7], ...Array.from({ length: 7 }, (_, i): [number, number] => [i, 0])]

interface FakeCtx {
    roundRect: ReturnType<typeof vi.fn>
    arc: ReturnType<typeof vi.fn>
    [k: string]: unknown
}
let ctx: FakeCtx

function makeCtx(): FakeCtx {
    const noop = vi.fn()
    return {
        clearRect: noop, beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop, fill: noop,
        arc: vi.fn(), roundRect: vi.fn(),
        createRadialGradient: () => ({ addColorStop: noop }),
        strokeStyle: '', lineWidth: 0, fillStyle: '',
    }
}

/** The snake as last drawn, head first, as board cells (head radius 4, body radius 3). */
function drawnSnake(): Array<[number, number]> {
    const calls = ctx.roundRect.mock.calls
    let h = calls.length - 1
    while (h > 0 && calls[h][4] !== 4) h--
    return calls.slice(h).map((c) => [(c[0] - 2) / CELL, (c[1] - 2) / CELL])
}
const head = () => drawnSnake()[0]

const tick = (n = 1) => act(() => { vi.advanceTimersByTime(TICK * n) })
const press = (key: string) => act(() => { fireEvent.keyDown(window, { key }) })
const click = (name: string) => act(() => { fireEvent.click(screen.getByRole('button', { name })) })
const start = () => click('start-game')

beforeEach(() => {
    vi.useFakeTimers()
    ctx = makeCtx()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ctx as unknown as CanvasRenderingContext2D)
    placeFood(ROW_FOOD)
})
afterEach(() => {
    vi.useRealTimers()
})

describe('SnakeGame — start and movement', () => {
    it('starts idle: a start button, a full set of 10 food, and nothing moves until started', () => {
        render(<SnakeGame />)

        expect(screen.getByRole('button', { name: 'start-game' })).toBeInTheDocument()
        expect(screen.getByText('press start')).toBeInTheDocument()
        expect(ctx.arc).toHaveBeenCalledTimes(20) // 10 food × (glow + core)
        const before = ctx.roundRect.mock.calls.length
        tick(5)
        expect(ctx.roundRect.mock.calls.length).toBe(before)
    })

    it('draws the starting snake (head + 2 body segments) heading right', () => {
        render(<SnakeGame />)

        expect(drawnSnake()).toEqual([[4, 7], [3, 7], [2, 7]])
    })

    it('after "start-game" the snake advances one cell right per tick', () => {
        render(<SnakeGame />)
        start()
        expect(screen.queryByText('press start')).not.toBeInTheDocument()

        tick()
        expect(head()).toEqual([5, 7])
        tick()
        expect(head()).toEqual([6, 7])
    })

    it.each([
        ['ArrowUp', [4, 6]], ['w', [4, 6]],
        ['ArrowDown', [4, 8]], ['s', [4, 8]],
    ])('"%s" turns the snake (next head %j)', (key, expected) => {
        render(<SnakeGame />)
        start()

        press(key)
        tick()

        expect(head()).toEqual(expected)
    })

    it('ignores a 180° reversal, so the snake cannot turn into itself', () => {
        render(<SnakeGame />)
        start()

        press('ArrowLeft') // moving right → opposite → ignored
        tick()

        expect(head()).toEqual([5, 7])
    })

    it('"a" and "d" are accepted as left/right once moving vertically', () => {
        render(<SnakeGame />)
        start()
        press('w'); tick()

        press('a'); tick()
        expect(head()).toEqual([3, 6])
    })

    it('prevents the page from scrolling for game keys but leaves other keys alone', () => {
        render(<SnakeGame />)
        start()

        const arrow = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true })
        const other = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
        act(() => { window.dispatchEvent(arrow); window.dispatchEvent(other) })

        expect(arrow.defaultPrevented).toBe(true)
        expect(other.defaultPrevented).toBe(false)
    })

    it('the on-screen arrow buttons steer too (touch devices)', () => {
        render(<SnakeGame />)
        start()

        click('Move up')
        tick()

        expect(head()).toEqual([4, 6])
    })

    it('stops listening to the keyboard after unmount', () => {
        const { unmount } = render(<SnakeGame />)
        start()
        unmount()
        const spy = vi.spyOn(Event.prototype, 'preventDefault')

        press('ArrowUp')

        expect(spy).not.toHaveBeenCalled()
    })

    it('does not crash when the canvas cannot provide a 2D context', () => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)

        expect(() => render(<SnakeGame />)).not.toThrow()
    })
})

describe('SnakeGame — winning', () => {
    it('eats food on the way, wraps around the edge, and wins after the 10th piece', () => {
        const onWin = vi.fn()
        render(<SnakeGame onWin={onWin} />)
        start()

        tick(9)
        expect(onWin).not.toHaveBeenCalled()
        expect(head()).toEqual([13, 7])
        tick() // wraps to x=0, where the last piece is
        expect(head()).toEqual([0, 7])

        expect(onWin).toHaveBeenCalledTimes(1)
        expect(screen.getByText('WELL DONE!')).toBeInTheDocument()
    })

    it('reports food eaten, elapsed time and how many turns were taken', () => {
        const onWin = vi.fn()
        render(<SnakeGame onWin={onWin} />)
        start()

        press('ArrowRight') // same direction: still counts as an accepted move
        tick(10)

        expect(onWin).toHaveBeenCalledWith({ eaten: 10, durationMs: 10 * TICK, moveCount: 1 })
    })

    it('reports a win only once, and the snake stops moving afterwards', () => {
        const onWin = vi.fn()
        render(<SnakeGame onWin={onWin} />)
        start()
        tick(10)
        const frozen = ctx.roundRect.mock.calls.length

        tick(10)

        expect(onWin).toHaveBeenCalledTimes(1)
        expect(ctx.roundRect.mock.calls.length).toBe(frozen)
    })

    it('counts down the lit food dots as pieces are eaten', () => {
        render(<SnakeGame />)
        start()

        tick(3) // ate 3
        expect(screen.getByText('// food left')).toBeInTheDocument()
        expect(document.querySelectorAll('aside [class*="rounded-full"]').length).toBeGreaterThan(0)
    })

    it('works without an onWin handler', () => {
        render(<SnakeGame />)
        start()

        expect(() => tick(10)).not.toThrow()
        expect(screen.getByText('WELL DONE!')).toBeInTheDocument()
    })
})

describe('SnakeGame — losing and restarting', () => {
    function crash() {
        vi.restoreAllMocks()
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ctx as unknown as CanvasRenderingContext2D)
        placeFood(SIDE_FOOD)
        const onWin = vi.fn()
        render(<SnakeGame onWin={onWin} />)
        start()
        tick(3)                                  // eat three → snake is 6 long
        press('ArrowUp'); tick()
        press('ArrowLeft'); tick()
        press('ArrowDown'); tick()               // steps back into its own body
        return onWin
    }

    it('hitting its own body ends the game with "GAME OVER!" and no win callback', () => {
        const onWin = crash()

        expect(screen.getByText('GAME OVER!')).toBeInTheDocument()
        expect(onWin).not.toHaveBeenCalled()
    })

    it('stops moving after game over', () => {
        crash()
        const frozen = ctx.roundRect.mock.calls.length

        tick(5)

        expect(ctx.roundRect.mock.calls.length).toBe(frozen)
    })

    it('"start-again" resets to a fresh idle game', () => {
        crash()

        click('start-again')

        expect(screen.getByRole('button', { name: 'start-game' })).toBeInTheDocument()
        expect(screen.queryByText('GAME OVER!')).not.toBeInTheDocument()
        expect(drawnSnake()).toEqual([[4, 7], [3, 7], [2, 7]])
    })
})

describe('SnakeGame — skip', () => {
    it('shows a skip button only when a handler is given, and calls it', () => {
        const onSkip = vi.fn()
        const { unmount } = render(<SnakeGame onSkip={onSkip} />)

        click('skip')
        expect(onSkip).toHaveBeenCalledTimes(1)
        unmount()

        render(<SnakeGame />)
        expect(screen.queryByRole('button', { name: 'skip' })).not.toBeInTheDocument()
    })
})
