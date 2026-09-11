import type { ReactNode } from 'react'

interface Props {
    leading?:  ReactNode
    title:     string
    subtitle?: string
    trailing?: ReactNode
    actions:   ReactNode
}

export function AdminListRow({ leading, title, subtitle, trailing, actions }: Props) {
    return (
        <div className="group flex items-center justify-between gap-3 px-4 py-3 hover:bg-(--bg-elevated) transition-colors duration-100">
            <div className="flex items-center gap-3 min-w-0">
                {leading}
                <div className="flex flex-col min-w-0">
                    <span className="font-mono text-sm text-(--text-primary) truncate">
                        {title}
                    </span>
                    {subtitle && (
                        <span className="font-mono text-xs text-(--text-muted) truncate">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
                {trailing}
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-100">
                    {actions}
                </div>
            </div>
        </div>
    )
}
