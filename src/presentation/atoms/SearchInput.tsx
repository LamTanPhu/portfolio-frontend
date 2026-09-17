import { Search, X } from 'lucide-react'

// =============================================================================
// SearchInput — Atom
// Compact search box, VS Code command-palette styling — smaller and denser
// than FormField, which is built for label+field admin forms, not an
// inline list filter.
// =============================================================================
interface Props {
  value:        string
  onChange:     (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'search posts...' }: Props) {
  return (
    <div className="relative flex items-center">
      <Search size={13} className="absolute left-2.5 text-(--text-muted) pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search blog posts"
        className={[
          'w-full bg-[rgba(1,13,24,0.6)] font-mono text-xs text-(--text-primary)',
          'border border-(--border-muted) focus:border-(--accent-teal)',
          'pl-8 pr-7 py-1.5 outline-none transition-colors duration-150',
          'placeholder:text-(--text-muted)',
        ].join(' ')}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          title="Clear search"
          className="absolute right-2 text-(--text-muted) hover:text-(--text-primary) transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
