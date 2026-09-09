'use client'
import { TrackResumeDownloadCommand } from '@/src/application/use-cases/commands/analytics/TrackResumeDownloadCommand'
import { RESUME_URL } from '@/lib/constants'

// =============================================================================
// ResumeDownloadButton — Atom
// Fires the analytics ping (best-effort, never blocks) then lets the
// <a> tag's normal navigation open the file — no preventDefault, so this
// still works via middle-click / "open in new tab" / with JS disabled.
//
// RESUME_URL has no real file behind it yet (see lib/constants.ts) — add
// the actual PDF at that path (or point the env var elsewhere) to make
// this functional; until then the link 404s but the tracking call still
// fires correctly.
// =============================================================================
export function ResumeDownloadButton() {
    return (
        <a
            href={RESUME_URL}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { void TrackResumeDownloadCommand.create().execute() }}
            className="font-mono text-xs text-(--text-muted) hover:text-(--accent-teal) transition-colors inline-flex items-center gap-1.5"
        >
            <span aria-hidden>⭳</span> resume.pdf
        </a>
    )
}
