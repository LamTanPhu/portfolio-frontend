// =============================================================================
// ArrowBtn — Atom (snake-specific)
// Single arrow key display button. Purely presentational.
// =============================================================================

interface Props {
    label: string
}

export function ArrowBtn({ label }: Props) {
    return (
        <div
            className="
                font-mono text-[10px]
                flex items-center justify-center
                w-6 h-6
                border border-(--border-muted)
                bg-[rgba(1,13,24,0.6)]
                text-(--text-muted)
                "
            >
                {label}
        </div>
    )
}