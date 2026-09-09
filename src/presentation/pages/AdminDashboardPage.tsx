import Link from 'next/link'

const SECTIONS = [
    { href: '/admin/blog',           label: 'blog',           desc: 'posts — draft & published' },
    { href: '/admin/projects',       label: 'projects',       desc: 'portfolio projects' },
    { href: '/admin/skills',         label: 'skills',         desc: 'tech stack, by category' },
    { href: '/admin/education',      label: 'education',      desc: 'degrees & institutions' },
    { href: '/admin/jobs',           label: 'jobs',           desc: 'work experience' },
    { href: '/admin/certifications', label: 'certifications', desc: 'certs & credentials' },
    { href: '/admin/social',         label: 'social',         desc: 'social account links' },
    { href: '/admin/contact',        label: 'contact',        desc: 'messages from visitors' },
    { href: '/admin/analytics',      label: 'analytics',      desc: 'page view stats' },
    { href: '/admin/audit',          label: 'audit',          desc: 'recent admin activity' },
]

// =============================================================================
// AdminDashboardPage — Page
// Landing page for /admin. Previously this route just redirected straight
// to /admin/blog — the only section that existed. Now that every resource
// has an admin UI, this is a real index instead of a dead end.
// =============================================================================
export function AdminDashboardPage() {
    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-6">
                <span className="text-(--text-muted)">_</span>admin
            </h1>

            <div className="grid grid-cols-2 gap-3">
                {SECTIONS.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="flex flex-col gap-1 px-4 py-3 border border-(--border-muted) hover:border-(--accent-teal) transition-colors"
                    >
                        <span className="font-mono text-sm text-(--text-primary)">{section.label}</span>
                        <span className="font-mono text-xs text-(--text-muted)">{section.desc}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
