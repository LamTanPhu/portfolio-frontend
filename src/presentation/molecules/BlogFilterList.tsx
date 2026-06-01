import { TechCheckbox } from '../atoms/TechCheckbox'

// =============================================================================
// BlogFilterList — Molecule
// Tag filter checkboxes for the blog sidebar.
// Reuses TechCheckbox atom — no icon needed for tags, just label.
// =============================================================================

const TAGS = [
    'architecture', 'typescript', 'react', 'nextjs',
    'css', 'tailwind', 'node', 'devops', 'career', 'design',
]

interface Props {
    selected: string[]
    onChange: (tag: string) => void
}

export function BlogFilterList({ selected, onChange }: Props) {
    return (
        <div className="flex flex-col px-2 py-2 gap-0.5">
            {TAGS.map((tag) => (
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