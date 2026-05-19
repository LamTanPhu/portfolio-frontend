// =============================================================================
// GameActions — Molecule (snake-specific)
// Bottom action bar. Shows different buttons depending on game phase.
// =============================================================================

type Phase = 'idle' | 'playing' | 'won' | 'lost'

interface Props {
    phase:   Phase
    eaten:   number
    onStart: () => void
    onReset: () => void
    onSkip?: () => void
}

export function GameActions({ phase, eaten, onStart, onReset, onSkip }: Props) {
    return (
        <footer className="flex items-center justify-between px-4 py-3 border-t border-(--border-muted)">

        {/* Left — phase-dependent action */}
        <div>
            {phase === 'idle' && (
            <button
                onClick={onStart}
                className="font-mono text-xs font-semibold px-4 py-1.5 transition-colors bg-(--accent-amber) text-[#010d18]"
            >
                start-game
            </button>
            )}

            {phase === 'playing' && (
            <span className="font-mono text-xs text-(--text-muted)">
                eaten: {eaten}
            </span>
            )}

            {(phase === 'won' || phase === 'lost') && (
            <button
                onClick={onReset}
                className="font-mono text-xs px-4 py-1.5 border border-(--border-muted) text-(--text-muted) transition-colors hover:text-(--text-primary)"
            >
                play-again
            </button>
            )}
        </div>

        {/* Right — always visible skip */}
        <button
            onClick={onSkip}
            className="font-mono text-xs px-3 py-1 border border-(--border-muted) text-(--text-muted) transition-colors hover:text-(--text-primary) ml-auto"
        >
            skip
        </button>

        </footer>
    )
}