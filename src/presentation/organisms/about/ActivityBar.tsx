'use client'
import { Terminal, User, Gamepad2 } from 'lucide-react'

// =============================================================================
// ActivityBar — Organism (about-page specific)
// Leftmost icon strip. Controls which sidebar panel is visible.
// =============================================================================

export type ActivityPanel = 'professional' | 'personal' | 'hobbies'

interface ActivityItem {
    id:    ActivityPanel
    icon:  React.ReactNode
    title: string
}

const ITEMS: ActivityItem[] = [
    { id: 'professional', icon: <Terminal size={20} />, title: 'Professional Info' },
    { id: 'personal',     icon: <User     size={20} />, title: 'Personal Info'     },
    { id: 'hobbies',      icon: <Gamepad2 size={20} />, title: 'Hobbies'           },
]

interface Props {
    active:   ActivityPanel
    onChange: (panel: ActivityPanel) => void
}

export function ActivityBar({ active, onChange }: Props) {
    return (
        <div className="flex flex-row lg:flex-col items-center justify-center lg:justify-start w-full lg:w-12 shrink-0 border-b lg:border-b-0 lg:border-r border-(--border-muted) bg-(--bg-sidebar) px-2 py-1.5 lg:px-0 lg:py-2 gap-1">
        {ITEMS.map((item) => (
            <button
            key={item.id}
            title={item.title}
            onClick={() => onChange(item.id)}
            className={[
                'flex items-center justify-center w-10 h-10 rounded-sm transition-colors duration-150',
                active === item.id
                ? 'text-(--text-primary) bg-(--bg-elevated) border-b-2 lg:border-b-0 lg:border-l-2 border-(--accent-teal)'
                : 'text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)',
            ].join(' ')}
            >
            {item.icon}
            </button>
        ))}
        </div>
    )
}