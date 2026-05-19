// =============================================================================
// NavTab — Atom
// Styling lives in globals.css under .nav-tab and .nav-tab--active.
// This keeps padding reliable and out of JIT scope.
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
      className={isActive ? 'nav-tab nav-tab--active' : 'nav-tab'}
    >
      {label}
    </button>
  )
}