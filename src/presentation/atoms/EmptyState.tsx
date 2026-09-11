import type { ReactNode } from 'react'

interface Props {
    icon:    ReactNode
    message: string
}

export function EmptyState({ icon, message }: Props) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-(--border-muted)">
            <span className="text-(--text-muted)">{icon}</span>
            <p className="font-mono text-sm text-(--text-muted)">{message}</p>
        </div>
    )
}
