'use client'
import { TrackResumeDownloadCommand } from '@/src/application/use-cases/commands/analytics/TrackResumeDownloadCommand'
import { RESUME_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

// =============================================================================
// ResumeDownloadButton — Atom
// Fires the analytics ping (best-effort, never blocks) then lets the
// <a> tag's normal navigation open the file — no preventDefault, so this
// still works via middle-click / "open in new tab" / with JS disabled.
//
// Variants:
//   inline — small muted text link (About page editor tab bar)
//   button — solid accent-filled button with glow, meant to be seen at a glance (header)
//
// The file is served from RESUME_URL (see lib/constants.ts).
// =============================================================================
interface Props {
    variant?: 'inline' | 'button'
    className?: string
}

const VARIANT_CLASSES: Record<NonNullable<Props['variant']>, string> = {
    inline:
        'text-xs text-(--text-muted) hover:text-(--accent-teal)',
    button:
        'text-sm sm:text-base px-4 sm:px-5 py-1.5 gap-2 border-2 border-(--accent-teal) bg-(--accent-teal) text-(--bg-surface) font-bold whitespace-nowrap shadow-[0_0_14px_rgba(0,194,179,0.5)] hover:bg-transparent hover:text-(--accent-teal)',
}

export function ResumeDownloadButton({ variant = 'inline', className }: Props) {
    return (
        <a
            href={RESUME_URL}
            download
            target="_blank"
            rel="noopener noreferrer"
            title="Download resume (PDF)"
            onClick={() => { void TrackResumeDownloadCommand.create().execute() }}
            className={cn(
                'font-mono transition-colors duration-150 inline-flex items-center gap-1.5',
                VARIANT_CLASSES[variant],
                className,
            )}
        >
            <span aria-hidden className={variant === 'button' ? 'text-base sm:text-lg leading-none' : undefined}>⭳</span>
            {variant === 'button' ? 'resume' : 'resume.pdf'}
        </a>
    )
}
