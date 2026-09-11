import type { ReactNode } from 'react'

interface Props {
    icon:      ReactNode
    title:     string
    count?:    number | null
    action?:   ReactNode
}

export function AdminPageHeader({ icon, title, count, action }: Props) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 border border-(--border-muted) text-(--accent-teal) bg-(--bg-elevated)">
                    {icon}
                </span>
                <h1 className="font-mono text-lg text-(--text-primary)">
                    <span className="text-(--text-muted)">_</span>{title}
                </h1>
                {typeof count === 'number' && (
                    <span className="font-mono text-[11px] text-(--text-muted) px-2 py-0.5 border border-(--border-muted)">
                        {count}
                    </span>
                )}
            </div>
            {action}
        </div>
    )
}
