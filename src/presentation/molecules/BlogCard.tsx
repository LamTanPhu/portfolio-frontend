import { BlogTag } from '../atoms/BlogTag'

// =============================================================================
// BlogCard — Molecule
// Compact post list item — file browser style.
// Title, date, tags. No excerpt here, that lives in the preview panel.
// =============================================================================

interface Props {
  title:      string
  slug:       string
  date:       string
  tags:       string[]
  isSelected: boolean
  onClick:    () => void
}

export function BlogCard({ title, date, tags, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left flex flex-col gap-2 px-4 py-3',
        'border-b border-(--border-subtle)',
        'transition-colors duration-100',
        isSelected
          ? 'bg-(--bg-elevated) border-l-2 border-l-(--accent-teal)'
          : 'hover:bg-(--bg-elevated) border-l-2 border-l-transparent',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={[
          'font-mono text-sm leading-snug',
          isSelected ? 'text-(--text-primary)' : 'text-(--text-muted)',
        ].join(' ')}>
          {title}
        </span>
        <time className="font-mono text-[11px] text-(--text-muted) shrink-0 mt-0.5">
          {date}
        </time>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <BlogTag key={tag} label={tag} />
        ))}
      </div>
    </button>
  )
}