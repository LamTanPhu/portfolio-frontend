import { cn } from '@/lib/utils'

interface Props { label: string; className?: string }

export function Badge({ label, className }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground', className)}>
      {label}
    </span>
  )
}
