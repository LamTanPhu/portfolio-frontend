

// =============================================================================
// GameSidebar — Molecule (snake-specific)
// Right panel: controls hint + arrow cluster + food dots + skip button.
// skip lives here, not in a shared footer.
// =============================================================================

import { ArrowBtn } from "../../atoms/snake/ArrowBtn"
import { FoodDot } from "../../atoms/snake/FoodDot"

const FOOD_COUNT = 10

interface Props {
    eaten:  number
    onSkip?: () => void
}

export function GameSidebar({ eaten, onSkip }: Props) {
    return (
        <aside className="flex flex-col justify-between p-4 gap-4 min-w-40">

        {/* Top — controls */}
        <section className="flex flex-col gap-3">
            <div>
            <p className="font-mono text-[11px] text-(--text-comment)">// use keyboard</p>
            <p className="font-mono text-[11px] text-(--text-comment)">// arrows to play</p>
            </div>

            {/* Arrow cluster card */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[rgba(0,0,0,0.25)] border border-(--border-subtle)">
            <ArrowBtn label="▲" />
            <div className="flex gap-1.5">
                <ArrowBtn label="◀" />
                <ArrowBtn label="▼" />
                <ArrowBtn label="▶" />
            </div>
            </div>
        </section>

        {/* Middle — skip + food counter */}
        <section className="flex flex-col gap-3">
            <button
            onClick={onSkip}
            className="w-full font-mono text-xs px-4 py-2 rounded-lg text-(--text-muted) border border-(--border-muted) hover:text-(--text-primary) hover:border-(--accent-teal) transition-colors duration-150"
            >
            skip
            </button>

            <div>
            <p className="font-mono text-[11px] text-(--text-comment) mb-2">// food left</p>
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