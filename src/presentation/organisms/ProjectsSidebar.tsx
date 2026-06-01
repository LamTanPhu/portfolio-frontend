import { TechFilterList } from '../molecules/TechFilterList'

// =============================================================================
// ProjectsSidebar — Organism
// Sidebar for projects page. Shows tech filter list under a projects header.
// =============================================================================

interface Props {
    selected: string[]
    onChange: (label: string) => void
}

export function ProjectsSidebar({ selected, onChange }: Props) {
    return (
        <aside className="w-56 shrink-0 flex flex-col border-r border-(--border-muted) bg-(--bg-sidebar) overflow-y-auto">

            {/* Header */}
            <header className="flex items-center gap-2 px-4 py-2.5 border-b border-(--border-muted) shrink-0">
                <span className="font-mono text-[11px] text-(--text-muted)">▾</span>
                <span className="font-mono text-sm text-(--text-primary)">projects</span>
            </header>

            {/* Filter list */}
            <TechFilterList selected={selected} onChange={onChange} />

        </aside>
    )
}