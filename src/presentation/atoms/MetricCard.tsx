import { cn } from '@/lib/utils'

// =============================================================================
// MetricCard — Atom
// Summary-number card for admin dashboards. Same bg-elevated/border-subtle
// surface StatusBadge/Button already use — no new tokens introduced.
// accent controls the value color only; label is always --text-muted.
// =============================================================================
interface Props {
    label: string
    value: string | number
    accent?: 'default' | 'teal' | 'amber'
    className?: string
}

export function MetricCard({ label, value, accent = 'default', className }: Props) {
    return (
        <div className={cn(
            'bg-(--bg-elevated) border border-(--border-subtle) px-4 py-3.5',
            className,
        )}>
            <div className="font-mono text-[11px] text-(--text-muted) mb-1.5">
                {label}
            </div>
            <div className={cn(
                'font-mono text-xl truncate',
                accent === 'teal'  && 'text-(--accent-teal)',
                accent === 'amber' && 'text-(--accent-amber)',
                accent === 'default' && 'text-(--text-primary)',
            )}>
                {value}
            </div>
        </div>
    )
}
