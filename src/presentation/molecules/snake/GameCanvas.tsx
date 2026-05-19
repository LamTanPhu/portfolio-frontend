import type { RefObject } from 'react'

// =============================================================================
// GameCanvas — Molecule (snake-specific)
// Renders the canvas and the "press start" idle overlay.
// All drawing is handled by the parent SnakeGame via the forwarded ref.
// =============================================================================

interface Props {
    canvasRef: RefObject<HTMLCanvasElement | null>
    width:     number
    height:    number
    isIdle:    boolean
}

export function GameCanvas({ canvasRef, width, height, isIdle }: Props) {
    return (
        <section
            className="relative border-r border-(--border-muted) bg-[rgba(1,13,24,0.6)]"
        >
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block"
        />

        {isIdle && (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(1,13,24,0.5)]">
            <span className="font-mono text-xs text-(--text-muted)">
                press start
            </span>
            </div>
        )}
        </section>
    )
}