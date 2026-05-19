import { cn } from '@/lib/utils'

// =============================================================================
// NavTab — Atom
// Width is driven by label length + fixed padding each side.
// Uses Tailwind v4 CSS variable shorthand: bg-(--var) not bg-[var(--var)]
// =============================================================================

interface Props {
  label:     string
  isActive?: boolean
  onClick?:  () => void
}

export function NavTab({ label, isActive, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Layout & typography
        'relative font-mono text-[13px] tracking-wide whitespace-nowrap',
        'w-max px-6 py-2.5',
        // Border
        'border-r border-(--border-muted)',
        // Transitions
        'transition-colors duration-150',
        // Hover
        'hover:bg-(--bg-elevated) hover:text-(--text-primary)',
        // Active vs inactive
        isActive
          ? [
              'bg-(--bg-tab-active) text-(--text-primary)',
              // Amber bottom indicator
              'after:absolute after:bottom-0 after:left-0 after:right-0',
              'after:h-0.5 after:bg-(--accent-amber)',
            ]
          : 'bg-(--bg-tab-inactive) text-(--text-muted)',
      )}
    >
      {label}
    </button>
  )
}