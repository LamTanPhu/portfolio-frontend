'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '../atoms/Button'

// =============================================================================
// AdminNav — Organism
// Dumb, prop-driven — same split as TabBar/Sidebar/StatusBar: this owns the
// markup, AdminShell (template) owns the auth logic and passes onLogout in.
// =============================================================================
interface Props {
    onLogout: () => void
}

const LINKS = [
    { href: '/admin/blog',           label: 'blog' },
    { href: '/admin/projects',       label: 'projects' },
    { href: '/admin/skills',         label: 'skills' },
    { href: '/admin/education',      label: 'education' },
    { href: '/admin/jobs',           label: 'jobs' },
    { href: '/admin/certifications', label: 'certifications' },
    { href: '/admin/social',         label: 'social' },
    { href: '/admin/contact',        label: 'contact' },
    { href: '/admin/analytics',      label: 'analytics' },
    { href: '/admin/audit',          label: 'audit' },
]

export function AdminNav({ onLogout }: Props) {
    const pathname = usePathname()

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-(--border-muted) shrink-0 gap-6">
            <nav className="flex items-center gap-5 flex-wrap">
                <Link href="/admin" className="font-mono text-sm text-(--accent-teal) shrink-0">
                    _admin
                </Link>
                {LINKS.map((link) => {
                    const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={[
                                'font-mono text-sm transition-colors',
                                active
                                    ? 'text-(--text-primary)'
                                    : 'text-(--text-muted) hover:text-(--text-primary)',
                            ].join(' ')}
                        >
                            {link.label}
                        </Link>
                    )
                })}
            </nav>
            <div className="flex items-center gap-4 shrink-0">
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
