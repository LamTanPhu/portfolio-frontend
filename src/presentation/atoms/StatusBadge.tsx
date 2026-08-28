import { cn } from '@/lib/utils'

// =============================================================================
// StatusBadge — Atom
// published/draft pill for admin list views. Same pill language as Badge —
// separate component because the color semantic (teal=live, muted=draft) is
// fixed, not caller-supplied like Badge's label.
// =============================================================================
interface Props {
    published: boolean
    className?: string
}

export function StatusBadge({ published, className }: Props) {
    return (
        <span className={cn(
            'inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] shrink-0',
            published
                ? 'text-(--accent-teal) border border-(--accent-teal)'
                : 'text-(--text-muted) border border-(--border-muted)',
            className,
        )}>
            {published ? 'published' : 'draft'}
        </span>
    )
}
