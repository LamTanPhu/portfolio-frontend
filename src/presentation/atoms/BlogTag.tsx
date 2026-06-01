// =============================================================================
// BlogTag — Atom
// Small tag badge. Used in post list and preview panel.
// =============================================================================

interface Props {
    label: string
}

export function BlogTag({ label }: Props) {
    return (
        <span className="font-mono text-[11px] text-(--text-keyword) border border-(--border-muted) px-2 py-0.5">
            #{label}
        </span>
    )
}