import { cn } from '@/lib/utils'

// =============================================================================
// Badge — Atom
// Tech stack tag — VS Code syntax-highlight inspired colors.
// =============================================================================
interface Props {
  label:     string
  className?: string
}

export function Badge({ label, className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 font-mono text-[11px] rounded-sm',
      'bg-[#1e1e1e] text-[#4ec9b0] border border-[#3c3c3c]',
      className,
    )}>
      {label}
    </span>
  )
}
