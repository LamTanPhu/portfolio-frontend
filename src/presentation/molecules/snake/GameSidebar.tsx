

// =============================================================================
// GameSidebar — Molecule (snake-specific)
// Right panel: controls hint + arrow cluster + food dots + skip button.
// skip lives here, not in a shared footer.
// =============================================================================

import { ArrowBtn } from "../../atoms/snake/ArrowBtn"
import { FoodDot } from "../../atoms/snake/FoodDot"

const FOOD_COUNT = 10

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

interface Props {
    eaten:   number
    onSkip?: () => void
    // Optional so this component still renders fine with no wiring at all
    // (shouldn't happen in practice — SnakeGame always passes it — but
    // keeps the prop honestly optional rather than a silent no-op crash).
    onTurn?: (dir: Dir) => void
}

export function GameSidebar({ eaten, onSkip, onTurn }: Props) {
    return (
        <aside className="flex flex-col justify-between p-4 gap-4 w-full sm:w-auto sm:min-w-40">

        {/* Top — controls */}
        <section className="flex flex-col gap-3">
            <div>
            <p className="font-mono text-[11px] text-(--text-comment)">{'// keyboard arrows'}</p>

            <p className="font-mono text-[11px] text-(--text-comment)">{'// or tap to play'}</p>
            </div>

            {/* Arrow cluster card */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[rgba(0,0,0,0.25)] border border-(--border-subtle)">
            <ArrowBtn label="▲" ariaLabel="Move up" onClick={() => onTurn?.('UP')} />
            <div className="flex gap-1.5">
                <ArrowBtn label="◀" ariaLabel="Move left" onClick={() => onTurn?.('LEFT')} />
                <ArrowBtn label="▼" ariaLabel="Move down" onClick={() => onTurn?.('DOWN')} />
                <ArrowBtn label="▶" ariaLabel="Move right" onClick={() => onTurn?.('RIGHT')} />
            </div>
            </div>
        </section>

        {/* Middle — skip + food counter */}
        <section className="flex flex-col gap-3">
            {/* Only rendered when a real skip handler exists — this used to
                always render, even for the homepage's decorative instance
                and (were it ever reused there) a gated instance where
                skipping must not be possible, doing nothing when clicked. */}
            {onSkip && (
            <button
                onClick={onSkip}
                className="w-full font-mono text-xs px-4 py-2 rounded-lg text-(--text-muted) border border-(--border-muted) hover:text-(--text-primary) hover:border-(--accent-teal) transition-colors duration-150"
            >
                skip
            </button>
            )}

            <div>
            <p className="font-mono text-[11px] text-(--text-comment) mb-2">{('// food left')}</p>
            <div className="flex flex-wrap gap-2 max-w-30">
                {Array.from({ length: FOOD_COUNT }).map((_, i) => (
                <FoodDot key={i} lit={i < FOOD_COUNT - eaten} />
                ))}
            </div>
            </div>
        </section>

        </aside>
    )
}