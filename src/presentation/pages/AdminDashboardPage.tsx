import Link from 'next/link'
import type { ReactNode } from 'react'
import {
    ScrollText, FolderCode, Tags, GraduationCap, Briefcase,
    Award, Share2, Inbox, BarChart3, ShieldAlert,
} from 'lucide-react'

interface Section {
    href:  string
    label: string
    desc:  string
    icon:  ReactNode
}

const SECTIONS: Section[] = [
    { href: '/admin/blog',           label: 'blog',           desc: 'posts — draft & published',  icon: <ScrollText size={18} /> },
    { href: '/admin/projects',       label: 'projects',       desc: 'portfolio projects',          icon: <FolderCode size={18} /> },
    { href: '/admin/skills',         label: 'skills',         desc: 'tech stack, by category',     icon: <Tags size={18} /> },
    { href: '/admin/education',      label: 'education',      desc: 'degrees & institutions',      icon: <GraduationCap size={18} /> },
    { href: '/admin/jobs',           label: 'jobs',           desc: 'work experience',             icon: <Briefcase size={18} /> },
    { href: '/admin/certifications', label: 'certifications', desc: 'certs & credentials',         icon: <Award size={18} /> },
    { href: '/admin/social',         label: 'social',         desc: 'social account links',        icon: <Share2 size={18} /> },
    { href: '/admin/contact',        label: 'contact',        desc: 'messages from visitors',      icon: <Inbox size={18} /> },
    { href: '/admin/analytics',      label: 'analytics',      desc: 'page view stats',             icon: <BarChart3 size={18} /> },
    { href: '/admin/audit',          label: 'audit',          desc: 'recent admin activity',       icon: <ShieldAlert size={18} /> },
]

// =============================================================================
// AdminDashboardPage — Page
// Landing page for /admin. Icons mirror AdminExplorer's file-tree icons so
// the dashboard reads as "the same files, zoomed out" rather than a
// separate visual language.
// =============================================================================
export function AdminDashboardPage() {
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-1">
                <span className="text-(--text-muted)">_</span>admin
            </h1>
            <p className="font-mono text-xs text-(--text-muted) mb-6">
                {'// everything wired to the live backend'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SECTIONS.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="group flex items-start gap-3 p-4 border border-(--border-muted) bg-(--bg-elevated)/40 hover:bg-(--bg-elevated) hover:border-(--accent-teal) transition-colors duration-150"
                    >
                        <span className="flex items-center justify-center w-9 h-9 shrink-0 border border-(--border-muted) text-(--text-muted) group-hover:text-(--accent-teal) group-hover:border-(--accent-teal) transition-colors duration-150">
                            {section.icon}
                        </span>
                        <div className="flex flex-col min-w-0 pt-0.5">
                            <span className="font-mono text-sm text-(--text-primary)">{section.label}</span>
                            <span className="font-mono text-[11px] text-(--text-muted)">{section.desc}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
