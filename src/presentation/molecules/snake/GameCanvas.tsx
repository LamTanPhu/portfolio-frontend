import type { RefObject } from 'react'

// =============================================================================
// GameCanvas — Molecule (snake-specific)
// Canvas panel. All action buttons live INSIDE here, overlaid at bottom.
// - idle:    start-game button overlaid at canvas bottom
// - won/lost: WELL DONE / GAME OVER banner + start-again inside canvas
// =============================================================================

type Phase = 'idle' | 'playing' | 'won' | 'lost'

interface Props {
    canvasRef: RefObject<HTMLCanvasElement | null>
    width:     number
    height:    number
    phase:     Phase
    onStart:   () => void
    onReset:   () => void
}

export function GameCanvas({ canvasRef, width, height, phase, onStart, onReset }: Props) {
    return (
        <section className="relative rounded-xl overflow-hidden border border-(--border-muted) bg-[rgba(1,13,24,0.8)] shadow-[inset_0_2px_12px_rgba(0,0,0,0.4)]">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="block"
            />

        {/* Idle — press start hint + button overlaid at bottom */}
        {phase === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 gap-3">
            <span className="font-mono text-xs text-(--text-muted) tracking-widest">
                press start
            </span>
            <button
                onClick={onStart}
                className="font-mono text-xs font-semibold px-6 py-2 rounded-sm bg-(--accent-amber) text-[#010d18] hover:opacity-90 transition-opacity"
            >
                start-game
            </button>
            </div>
        )}

        {/* End state — banner at canvas bottom */}
        {(phase === 'won' || phase === 'lost') && (
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 px-4 py-4 bg-[rgba(1,13,24,0.92)] border-t border-(--border-muted)">
            <p className={`font-mono text-sm font-bold tracking-widest ${phase === 'won' ? 'text-(--accent-teal)' : 'text-(--accent-amber)'}`}>
                {phase === 'won' ? 'WELL DONE!' : 'GAME OVER!'}
            </p>
            <button
                onClick={onReset}
                className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors tracking-wide"
            >
                start-again
            </button>
            </div>
        )}
        </section>
    )
}