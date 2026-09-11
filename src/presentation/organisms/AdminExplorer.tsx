'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutGrid, ScrollText, FolderCode, Tags, GraduationCap,
    Briefcase, Award, Share2, Inbox, BarChart3, ShieldAlert,
    ChevronRight, ChevronDown, Folder, FolderOpen,
} from 'lucide-react'

// =============================================================================
// AdminExplorer — Organism
// The admin section's equivalent of the public site's Sidebar/AboutSidebar —
// same "VS Code Explorer panel" language (bg-sidebar, mono labels, hover
// highlight) but as a flat/grouped file tree of admin routes instead of
// content links, with active-route highlighting (which the public Sidebar
// doesn't need, since it's not tab-like navigation there).
// =============================================================================
interface FileItem {
    href:  string
    label: string
    icon:  React.ReactNode
}

const TOP_FILES: FileItem[] = [
    { href: '/admin',           label: 'dashboard',  icon: <LayoutGrid size={14} /> },
    { href: '/admin/blog',      label: 'blog.ts',     icon: <ScrollText size={14} /> },
    { href: '/admin/projects',  label: 'projects.ts', icon: <FolderCode size={14} /> },
]

const ABOUT_CONTENT_FILES: FileItem[] = [
    { href: '/admin/skills',         label: 'skills.ts',         icon: <Tags size={14} /> },
    { href: '/admin/education',      label: 'education.ts',      icon: <GraduationCap size={14} /> },
    { href: '/admin/jobs',           label: 'jobs.ts',           icon: <Briefcase size={14} /> },
    { href: '/admin/certifications', label: 'certifications.ts', icon: <Award size={14} /> },
    { href: '/admin/social',         label: 'social.ts',         icon: <Share2 size={14} /> },
]

const BOTTOM_FILES: FileItem[] = [
    { href: '/admin/contact',   label: 'inbox.ts',     icon: <Inbox size={14} /> },
    { href: '/admin/analytics', label: 'analytics.ts', icon: <BarChart3 size={14} /> },
    { href: '/admin/audit',     label: 'audit.log',    icon: <ShieldAlert size={14} /> },
]

function isActive(pathname: string, href: string): boolean {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(`${href}/`)
}

function FileRow({ item, active }: { item: FileItem; active: boolean; indent?: boolean }) {
    return (
        <Link
            href={item.href}
            title={item.label}
            className={[
                'flex items-center gap-2 pl-3 pr-2 py-1.5 font-mono text-[13px] border-l-2 transition-colors duration-100',
                active
                    ? 'border-(--accent-teal) bg-(--bg-elevated) text-(--text-primary)'
                    : 'border-transparent text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-elevated)',
            ].join(' ')}
        >
            <span className={active ? 'text-(--accent-teal)' : 'opacity-70'}>{item.icon}</span>
            <span>{item.label}</span>
        </Link>
    )
}

export function AdminExplorer() {
    const pathname = usePathname()
    const [aboutOpen, setAboutOpen] = useState(true)

    const aboutHasActive = ABOUT_CONTENT_FILES.some((f) => isActive(pathname, f.href))

    return (
        <aside className="w-60 shrink-0 flex flex-col border-r border-(--border-muted) bg-(--bg-sidebar) overflow-y-auto">
            <header className="px-4 py-2 border-b border-(--border-muted) shrink-0">
                <span className="font-mono text-[11px] text-(--text-muted) uppercase tracking-widest">
                    Explorer
                </span>
            </header>

            <div className="px-4 py-2 border-b border-(--border-subtle) shrink-0">
                <span className="font-mono text-[11px] text-(--text-secondary) uppercase tracking-widest">
                    admin-panel
                </span>
            </div>

            <nav className="flex flex-col py-2">
                {TOP_FILES.map((item) => (
                    <FileRow key={item.href} item={item} active={isActive(pathname, item.href)} />
                ))}

                {/* Collapsible folder — about-page content resources */}
                <button
                    type="button"
                    onClick={() => setAboutOpen((v) => !v)}
                    className={[
                        'flex items-center gap-1.5 pl-2 pr-2 py-1.5 font-mono text-[13px] transition-colors duration-100 mt-1',
                        aboutHasActive ? 'text-(--text-primary)' : 'text-(--text-muted) hover:text-(--text-primary)',
                    ].join(' ')}
                >
                    {aboutOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {aboutOpen ? <FolderOpen size={14} className="text-(--accent-amber)" /> : <Folder size={14} className="text-(--accent-amber)" />}
                    <span>about-content/</span>
                </button>
                {aboutOpen && (
                    <div className="flex flex-col pl-4 border-l border-(--border-subtle) ml-5">
                        {ABOUT_CONTENT_FILES.map((item) => (
                            <FileRow key={item.href} item={item} active={isActive(pathname, item.href)} />
                        ))}
                    </div>
                )}

                <div className="mt-1 pt-1 border-t border-(--border-subtle)">
                    {BOTTOM_FILES.map((item) => (
                        <FileRow key={item.href} item={item} active={isActive(pathname, item.href)} />
                    ))}
                </div>
            </nav>
        </aside>
    )
}
