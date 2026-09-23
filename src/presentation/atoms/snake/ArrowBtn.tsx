// =============================================================================
// ArrowBtn — Atom (snake-specific)
// Larger, rounder arrow key button. Tactile feel.
// Was a decorative <div> with no onClick — the on-screen controls looked
// interactive but did nothing, leaving the game entirely keyboard-only.
// =============================================================================

interface Props {
    label:    string
    onClick?: () => void
    ariaLabel: string
}

export function ArrowBtn({ label, onClick, ariaLabel }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            className="
            flex items-center justify-center
            w-10 h-10 rounded-lg
            font-mono text-sm
            text-(--text-primary)
            bg-[rgba(0,194,179,0.08)]
            border border-(--border-muted)
            hover:bg-[rgba(0,194,179,0.15)]
            hover:border-(--accent-teal)
            active:bg-[rgba(0,194,179,0.25)]
            transition-colors duration-150
            select-none touch-manipulation
            ">
            {label}
        </button>
    )
}