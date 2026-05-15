import { cn } from '@/lib/utils'

// =============================================================================
// NavTab — Atom
// Width is driven by label length + fixed 24px padding each side.
// Inline styles used for padding to bypass Tailwind JIT issues.
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
      style={{
        paddingLeft:     '24px',
        paddingRight:    '24px',
        paddingTop:      '10px',
        paddingBottom:   '10px',
        width:           'max-content',
        borderRight:     '1px solid var(--border-muted)',
        fontFamily:      'inherit',
        fontSize:        '13px',
        letterSpacing:   '0.03em',
        whiteSpace:      'nowrap',
        position:        'relative',
        transition:      'background-color 150ms, color 150ms',
        backgroundColor: isActive ? 'var(--bg-tab-active)'  : 'var(--bg-tab-inactive)',
        color:           isActive ? 'var(--text-primary)'   : 'var(--text-muted)',
      }}
      className={cn(
        'font-mono',
        'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
        isActive && [
          'after:absolute after:bottom-0 after:left-0 after:right-0',
          'after:h-[2px] after:bg-[var(--accent-amber)]',
        ],
      )}
    >
      {label}
    </button>
  )
}