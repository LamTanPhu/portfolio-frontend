// =============================================================================
// ArrowBtn — Atom (snake-specific)
// Larger, rounder arrow key button. Tactile feel.
// =============================================================================

interface Props {
    label: string
}

export function ArrowBtn({ label }: Props) {
    return (
        <div className="
            flex items-center justify-center
            w-10 h-10 rounded-lg
            font-mono text-sm
            text-(--text-primary)
            bg-[rgba(0,194,179,0.08)]
            border border-(--border-muted)
            hover:bg-[rgba(0,194,179,0.15)]
            hover:border-(--accent-teal)
            transition-colors duration-150
            select-none cursor-default
            ">
            {label}
        </div>
    )
}