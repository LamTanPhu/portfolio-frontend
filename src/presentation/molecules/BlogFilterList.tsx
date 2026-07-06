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
        <div className="flex flex-col px-2 py-2 gap-0.5">
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