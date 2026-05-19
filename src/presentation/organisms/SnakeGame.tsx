'use client'
import { useEffect, useRef, useCallback, useReducer } from 'react'
import { GameActions } from '../molecules/snake/GameActions'
import { GameCanvas } from '../molecules/snake/GameCanvas'
import { GameSidebar } from '../molecules/snake/GameSidebar'


// =============================================================================
// SnakeGame — Organism
// Owns all game state and logic via useReducer.
// Composes GameCanvas, GameSidebar, GameActions.
// Canvas drawing happens here via ref — keeps draw logic co-located with state.
// =============================================================================

const COLS       = 14
const ROWS       = 14
const CELL       = 24
const FOOD_COUNT = 10
const TICK_MS    = 140

type Dir   = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Pos   = { x: number; y: number }
type Phase = 'idle' | 'playing' | 'won' | 'lost'

interface State {
  snake:   Pos[]
  dir:     Dir
  nextDir: Dir
  food:    Pos[]
  eaten:   number
  phase:   Phase
}

function randPos(exclude: Pos[]): Pos {
  let p: Pos
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (exclude.some(e => e.x === p.x && e.y === p.y))
  return p
}

function initFood(snake: Pos[]): Pos[] {
  const food: Pos[] = []
  for (let i = 0; i < FOOD_COUNT; i++) food.push(randPos([...snake, ...food]))
  return food
}

function initState(): State {
  const snake = [{ x: 4, y: 7 }, { x: 3, y: 7 }, { x: 2, y: 7 }]
  return { snake, dir: 'RIGHT', nextDir: 'RIGHT', food: initFood(snake), eaten: 0, phase: 'idle' }
}

type Action =
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'TURN'; dir: Dir }
  | { type: 'TICK' }

const OPPOSITE: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'START': return { ...s, phase: 'playing' }
    case 'RESET': return initState()
    case 'TURN': {
      if (a.dir === OPPOSITE[s.dir]) return s
      return { ...s, nextDir: a.dir }
    }
    case 'TICK': {
      if (s.phase !== 'playing') return s
      const dir  = s.nextDir
      const head = s.snake[0]
      const next: Pos = {
        x: (head.x + (dir === 'RIGHT' ? 1 : dir === 'LEFT' ? -1 : 0) + COLS) % COLS,
        y: (head.y + (dir === 'DOWN'  ? 1 : dir === 'UP'   ? -1 : 0) + ROWS) % ROWS,
      }
      if (s.snake.some(p => p.x === next.x && p.y === next.y)) {
        return { ...s, phase: 'lost' }
      }
      const ateIdx   = s.food.findIndex(f => f.x === next.x && f.y === next.y)
      const ate      = ateIdx !== -1
      const newSnake = ate ? [next, ...s.snake]                    : [next, ...s.snake.slice(0, -1)]
      const newFood  = ate ? s.food.filter((_, i) => i !== ateIdx) : s.food
      const newEaten = ate ? s.eaten + 1 : s.eaten
      return {
        ...s,
        snake:   newSnake,
        dir,
        nextDir: dir,
        food:    newFood,
        eaten:   newEaten,
        phase:   newFood.length === 0 ? 'won' : 'playing',
      }
    }
    default: return s
  }
}

interface Props {
  onSkip?: () => void
}

export function SnakeGame({ onSkip }: Props) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const canvasRef         = useRef<HTMLCanvasElement>(null)
  const tickRef           = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tick loop
  useEffect(() => {
    if (state.phase === 'playing') {
      tickRef.current = setInterval(() => dispatch({ type: 'TICK' }), TICK_MS)
    } else {
      if (tickRef.current) clearInterval(tickRef.current)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [state.phase])

  // Keyboard
  const handleKey = useCallback((e: KeyboardEvent) => {
    const map: Record<string, Dir> = {
      ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
      w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
    }
    if (map[e.key]) {
      e.preventDefault()
      dispatch({ type: 'TURN', dir: map[e.key] })
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Grid lines
    ctx.strokeStyle = 'rgba(13, 43, 64, 0.6)'
    ctx.lineWidth   = 0.5
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke()
    }

    // Food dots
    state.food.forEach(f => {
      ctx.fillStyle = '#00c2b3'
      ctx.beginPath()
      ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Snake body
    state.snake.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? '#7fdbca' : '#00c2b3'
      const pad = i === 0 ? 2 : 3
      ctx.fillRect(p.x * CELL + pad, p.y * CELL + pad, CELL - pad * 2, CELL - pad * 2)
    })

    // End-state overlay
    if (state.phase === 'won' || state.phase === 'lost') {
      ctx.fillStyle = 'rgba(1, 13, 24, 0.75)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = state.phase === 'won' ? '#00c2b3' : '#e5a00d'
      ctx.font      = 'bold 14px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(
        state.phase === 'won' ? 'WELL DONE!' : 'GAME OVER',
        canvas.width / 2,
        canvas.height / 2,
      )
    }
  }, [state])

  return (
    <article
      className="
        flex flex-col
        border border-(--border-muted)
        bg-[rgba(1,22,39,0.85)]
        backdrop-blur-sm
        shadow-[0_0_40px_rgba(0,194,179,0.08)]
        rounded-sm
      "
    >
      {/* Game area: canvas + sidebar */}
      <div className="flex">
        <GameCanvas
          canvasRef={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          isIdle={state.phase === 'idle'}
        />
        <GameSidebar eaten={state.eaten} />
      </div>

      {/* Action buttons */}
      <GameActions
        phase={state.phase}
        eaten={state.eaten}
        onStart={() => dispatch({ type: 'START' })}
        onReset={() => dispatch({ type: 'RESET' })}
        onSkip={onSkip}
      />
    </article>
  )
}