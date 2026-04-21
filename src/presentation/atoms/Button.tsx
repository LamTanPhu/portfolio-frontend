import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className, children, ...props }: Props) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
