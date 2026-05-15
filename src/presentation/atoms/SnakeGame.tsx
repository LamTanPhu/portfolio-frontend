'use client'
import { useEffect, useRef, useCallback, useReducer } from 'react'

// =============================================================================
// SnakeGame — Atom (client)
// Keyboard-controlled snake game. Matches Figma reference layout:
// game canvas left, controls + food dots right, start/skip buttons bottom.
// =============================================================================

const COLS        = 14
const ROWS        = 14
const CELL        = 24
const FOOD_COUNT  = 10
const TICK_MS     = 140

type Dir  = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Pos  = { x: number; y: number }
type Phase = 'idle' | 'playing' | 'won' | 'lost'

interface State {
  snake:    Pos[]
  dir:      Dir
  nextDir:  Dir
  food:     Pos[]
  eaten:    number
  phase:    Phase
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
      // Self collision
      if (s.snake.some(p => p.x === next.x && p.y === next.y)) {
        return { ...s, phase: 'lost' }
      }
      const ateIdx = s.food.findIndex(f => f.x === next.x && f.y === next.y)
      const ate    = ateIdx !== -1
      const newSnake = ate ? [next, ...s.snake] : [next, ...s.snake.slice(0, -1)]
      const newFood  = ate ? s.food.filter((_, i) => i !== ateIdx) : s.food
      const newEaten = ate ? s.eaten + 1 : s.eaten
      const won      = newFood.length === 0
      return {
        ...s,
        snake:   newSnake,
        dir,
        nextDir: dir,
        food:    newFood,
        eaten:   newEaten,
        phase:   won ? 'won' : 'playing',
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

    // Grid
    ctx.strokeStyle = 'rgba(13, 43, 64, 0.6)'
    ctx.lineWidth   = 0.5
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke()
    }

    // Food
    state.food.forEach(f => {
      ctx.fillStyle = '#00c2b3'
      ctx.beginPath()
      ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Snake
    state.snake.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? '#7fdbca' : '#00c2b3'
      const pad = i === 0 ? 2 : 3
      ctx.fillRect(p.x * CELL + pad, p.y * CELL + pad, CELL - pad * 2, CELL - pad * 2)
    })

    // Overlay messages
    if (state.phase === 'won' || state.phase === 'lost') {
      ctx.fillStyle = 'rgba(1, 13, 24, 0.75)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle   = state.phase === 'won' ? '#00c2b3' : '#e5a00d'
      ctx.font        = 'bold 14px JetBrains Mono, monospace'
      ctx.textAlign   = 'center'
      ctx.fillText(
        state.phase === 'won' ? 'WELL DONE!' : 'GAME OVER',
        canvas.width / 2,
        canvas.height / 2,
      )
    }
  }, [state])

  const canvasW = COLS * CELL
  const canvasH = ROWS * CELL

  return (
    <div
      className="flex flex-col"
      style={{
        border:          '1px solid var(--border-muted)',
        backgroundColor: 'rgba(1, 22, 39, 0.85)',
        backdropFilter:  'blur(8px)',
        boxShadow:       '0 0 40px rgba(0, 194, 179, 0.08)',
        borderRadius:    '2px',
      }}
    >
      {/* Inner layout: canvas left, info right */}
      <div className="flex gap-0">

        {/* Canvas */}
        <div
          style={{
            borderRight:     '1px solid var(--border-muted)',
            backgroundColor: 'rgba(1, 13, 24, 0.6)',
            position:        'relative',
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasW}
            height={canvasH}
            style={{ display: 'block' }}
          />
          {/* start overlay */}
          {state.phase === 'idle' && (
            <div
              style={{
                position:  'absolute', inset: 0,
                display:   'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(1, 13, 24, 0.5)',
              }}
            >
              <span
                className="font-mono text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                press start
              </span>
            </div>
          )}
        </div>

        {/* Right info panel */}
        <div className="flex flex-col justify-between p-4 gap-4" style={{ minWidth: '140px' }}>

          {/* Controls hint */}
          <div>
            <p className="font-mono text-[11px] mb-2" style={{ color: 'var(--text-comment)' }}>
              // use keyboard
            </p>
            <p className="font-mono text-[11px] mb-3" style={{ color: 'var(--text-comment)' }}>
              // arrows to play
            </p>
            {/* Arrow key display */}
            <div className="flex flex-col items-center gap-1">
              <ArrowBtn label="▲" />
              <div className="flex gap-1">
                <ArrowBtn label="◀" />
                <ArrowBtn label="▼" />
                <ArrowBtn label="▶" />
              </div>
            </div>
          </div>

          {/* Food counter */}
          <div>
            <p className="font-mono text-[11px] mb-2" style={{ color: 'var(--text-comment)' }}>
              // food left
            </p>
            <div className="flex flex-wrap gap-1.5" style={{ maxWidth: '120px' }}>
              {Array.from({ length: FOOD_COUNT }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width:           '8px',
                    height:          '8px',
                    borderRadius:    '50%',
                    backgroundColor: i < (FOOD_COUNT - state.eaten)
                      ? '#00c2b3'
                      : 'var(--border-muted)',
                    display: 'block',
                    transition: 'background-color 200ms',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom — action buttons */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: '1px solid var(--border-muted)' }}
      >
        {state.phase === 'idle' && (
          <button
            onClick={() => dispatch({ type: 'START' })}
            className="font-mono text-xs transition-colors"
            style={{
              backgroundColor: 'var(--accent-amber)',
              color:           '#010d18',
              padding:         '6px 16px',
              fontWeight:      600,
            }}
          >
            start-game
          </button>
        )}

        {state.phase === 'playing' && (
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            eaten: {state.eaten}
          </span>
        )}

        {(state.phase === 'won' || state.phase === 'lost') && (
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="font-mono text-xs transition-colors"
            style={{
              color:  'var(--text-muted)',
              border: '1px solid var(--border-muted)',
              padding:'6px 16px',
            }}
          >
            play-again
          </button>
        )}

        <button
          onClick={onSkip}
          className="font-mono text-xs transition-colors ml-auto"
          style={{
            color:   'var(--text-muted)',
            border:  '1px solid var(--border-muted)',
            padding: '4px 12px',
          }}
        >
          skip
        </button>
      </div>
    </div>
  )
}

function ArrowBtn({ label }: { label: string }) {
    return (
        <div
        className="font-mono text-[10px] flex items-center justify-center"
        style={{
            width:           '24px',
            height:          '24px',
            border:          '1px solid var(--border-muted)',
            backgroundColor: 'rgba(1, 13, 24, 0.6)',
            color:           'var(--text-muted)',
        }}
        >
        {label}
        </div>
    )
}