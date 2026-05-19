// =============================================================================
// FoodDot — Atom (snake-specific)
// Single dot in the food counter. Lit = food remaining, dim = eaten.
// =============================================================================

interface Props {
    lit: boolean
}

export function FoodDot({ lit }: Props) {
    return (
        <span
            className={[
                'block w-2 h-2 rounded-full transition-colors duration-200',
                lit ? 'bg-[#00c2b3]' : 'bg-(--border-muted)',
            ].join(' ')}
        />
    )
}