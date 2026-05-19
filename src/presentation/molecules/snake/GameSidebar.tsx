

// =============================================================================
// GameSidebar — Molecule (snake-specific)
// Right panel: keyboard hint + arrow key cluster + food dot counter.
// =============================================================================

import { ArrowBtn } from "../../atoms/snake/ArrowBtn"
import { FoodDot } from "../../atoms/snake/FoodDot"

const FOOD_COUNT = 10

interface Props {
    eaten: number
}

export function GameSidebar({ eaten }: Props) {
    return (
        <aside className="flex flex-col justify-between p-4 gap-4 min-w-35">

        {/* Controls hint */}
        <section className="flex flex-col gap-3">
            <div>
            <p className="font-mono text-[11px] text-(--text-comment)">// use keyboard</p>
            <p className="font-mono text-[11px] text-(--text-comment)">// arrows to play</p>
            </div>

            {/* Arrow key cluster */}
            <div className="flex flex-col items-center gap-1">
            <ArrowBtn label="▲" />
            <div className="flex gap-1">
                <ArrowBtn label="◀" />
                <ArrowBtn label="▼" />
                <ArrowBtn label="▶" />
            </div>
            </div>
        </section>

        {/* Food counter */}
        <section>
            <p className="font-mono text-[11px] text-(--text-comment) mb-2">// food left</p>
            <div className="flex flex-wrap gap-1.5 max-w-30">
            {Array.from({ length: FOOD_COUNT }).map((_, i) => (
                <FoodDot key={i} lit={i < FOOD_COUNT - eaten} />
            ))}
            </div>
        </section>

        </aside>
    )
}