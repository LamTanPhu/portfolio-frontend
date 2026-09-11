'use client'
import Link from 'next/link'
import { LogOut, ExternalLink } from 'lucide-react'
import { Button } from '../atoms/Button'

// =============================================================================
// AdminNav — Organism
// Slim top bar — navigation itself now lives in AdminExplorer (the sidebar),
// so this only owns identity + exit actions, mirroring the public TabBar's
// "owner name far left, escape-hatch far right" split.
// =============================================================================
interface Props {
    onLogout: () => void
}

export function AdminNav({ onLogout }: Props) {
    return (
        <header className="flex items-center justify-between px-5 h-11 shrink-0 border-b border-(--border-muted) bg-(--bg-tab-bar)">
            <Link href="/admin" className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-(--accent-teal)" />
                <span className="font-mono text-sm text-(--text-primary) tracking-wide">
                    admin<span className="text-(--text-muted)">.workspace</span>
                </span>
            </Link>
            <div className="flex items-center gap-1">
                <Link
                    href="/"
                    className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated) transition-colors"
                >
                    <ExternalLink size={13} />
                    site
                </Link>
                <Button variant="ghost" size="sm" onClick={onLogout} className="flex items-center gap-1.5">
                    <LogOut size={13} />
                    logout
                </Button>
            </div>
        </header>
    )
}
