// =============================================================================
// ActiveFilterTab — Molecule
// Shows active tech filters as "React; Vue ×" in a tab-style bar.
// Only renders when at least one filter is active.
// =============================================================================

interface Props {
    selected: string[]
    onClear:  () => void
}

export function ActiveFilterTab({ selected, onClear }: Props) {
    if (selected.length === 0) return null

    return (
        <div className="flex items-center border-b border-(--border-muted) bg-(--bg-tab-bar) px-0 shrink-0">
            <div className="flex items-center gap-2 px-5 py-2.5 border-r border-(--border-muted) bg-(--bg-tab-active)">
                <span className="font-mono text-xs text-(--text-primary)">
                {selected.join('; ')}
                </span>
                <button
                onClick={onClear}
                title="Clear filters"
                className="font-mono text-[10px] text-(--text-muted) hover:text-(--text-primary) transition-colors ml-1"
                >
                ×
                </button>
            </div>
        </div>
    )
}