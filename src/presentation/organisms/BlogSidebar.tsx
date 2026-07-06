import { BlogFilterList } from '../molecules/BlogFilterList'

// =============================================================================
// BlogSidebar — Organism
// Sidebar for blog page. Tag filters under a blog header.
// =============================================================================

interface Props {
    tags:     string[]
    selected: string[]
    onChange: (tag: string) => void
}

export function BlogSidebar({ tags, selected, onChange }: Props) {
    return (
        <aside className="w-48 shrink-0 flex flex-col border-r border-(--border-muted) bg-(--bg-sidebar) overflow-y-auto">

        <header className="flex items-center gap-2 px-4 py-2.5 border-b border-(--border-muted) shrink-0">
            <span className="font-mono text-[11px] text-(--text-muted)">▾</span>
            <span className="font-mono text-sm text-(--text-primary)">blog</span>
        </header>

        <BlogFilterList tags={tags} selected={selected} onChange={onChange} />

        </aside>
    )
}