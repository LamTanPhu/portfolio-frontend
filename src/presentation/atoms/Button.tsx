import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'
// =============================================================================
// Button — Atom
// VS Code-inspired — minimal, sharp corners, subtle hover states.
// =============================================================================
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?:    'sm' | 'md'
}

export function Button({
  variant  = 'primary',
  size     = 'md',
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-mono text-xs transition-colors focus:outline-none disabled:opacity-50',
        size === 'sm' && 'px-3 py-1',
        size === 'md' && 'px-4 py-2',
        variant === 'primary' && 'bg-[#0e639c] text-white hover:bg-[#1177bb]',
        variant === 'ghost'   && 'text-[#cccccc] hover:bg-[#2a2d2e]',
        variant === 'danger'  && 'text-[#f48771] hover:bg-[#2a2d2e]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
