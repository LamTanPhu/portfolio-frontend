'use client'
import Link from 'next/link'
import { Button } from '../atoms/Button'

// =============================================================================
// AdminNav — Organism
// Dumb, prop-driven — same split as TabBar/Sidebar/StatusBar: this owns the
// markup, AdminShell (template) owns the auth logic and passes onLogout in.
// =============================================================================
interface Props {
    onLogout: () => void
}

export function AdminNav({ onLogout }: Props) {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-(--border-muted) shrink-0">
            <nav className="flex items-center gap-6">
                <span className="font-mono text-sm text-(--accent-teal)">_admin</span>
                <Link href="/admin/blog" className="font-mono text-sm text-(--text-muted) hover:text-(--text-primary) transition-colors">
                    blog
                </Link>
                {/* More sections (projects, skills, jobs, education, certifications,
                    social, profile) follow the same pattern as blog once needed. */}
            </nav>
            <div className="flex items-center gap-4">
                <Link href="/" className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors">
                    ← back to site
                </Link>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                    logout
                </Button>
            </div>
        </header>
    )
}
