import { TechCheckbox } from '../atoms/TechCheckbox'

// =============================================================================
// BlogFilterList — Molecule
// Tag filter checkboxes for the blog sidebar.
// Reuses TechCheckbox atom — no icon needed for tags, just label.
//
// `tags` is derived from real published posts (see BlogPage.tsx) — this
// component no longer owns a hardcoded tag list, so it never shows a tag
// with zero matching posts or misses one that's actually in use.
// =============================================================================

interface Props {
    tags:     string[]
    selected: string[]
    onChange: (tag: string) => void
}

export function BlogFilterList({ tags, selected, onChange }: Props) {
    return (
        <div className="flex flex-row flex-wrap gap-1 px-3 py-2 lg:flex-col lg:flex-nowrap lg:gap-0.5 lg:px-2">
            {tags.map((tag) => (
                <TechCheckbox
                key={tag}
                label={`#${tag}`}
                icon={null}
                checked={selected.includes(tag)}
                onChange={() => onChange(tag)}
                />
            ))}
        </div>
    )
}