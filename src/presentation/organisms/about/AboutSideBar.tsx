import type { ActivityPanel } from './ActivityBar'

// =============================================================================
// AboutSidebar — Organism (about-page specific)
// Renders different sidebar content based on active activity panel.
// =============================================================================

interface SidebarLink {
    label:    string
    href:     string
    dot?:     string
    icon?:    string
    external?: boolean
}

interface SidebarGroup {
    label:    string
    children: SidebarLink[]
}

// ── Panel data ────────────────────────────────────────────────

const PROFESSIONAL: SidebarGroup[] = [
    {
        label: 'experience',
        children: [
            { label: 'full-stack-dev',  href: '#', dot: 'dot-teal' },
            { label: 'freelance',       href: '#', dot: 'dot-blue' },
        ],
    },
    {
        label: 'skills',
        children: [
            { label: 'typescript',  href: '#', dot: 'dot-blue'  },
            { label: 'react',       href: '#', dot: 'dot-teal'  },
            { label: 'node.js',     href: '#', dot: 'dot-green' },
            { label: 'postgresql',  href: '#', dot: 'dot-grey'  },
        ],
    },
    {
        label: 'certificates',
        children: [
            { label: 'aws-cloud',   href: '#', dot: 'dot-amber' },
        ],
    },
    ]

    const PERSONAL: SidebarGroup[] = [
    {
        label: 'personal-info',
        children: [
            { label: 'bio',       href: '/about',           dot: 'dot-red'  },
            { label: 'interests', href: '/about#interests', dot: 'dot-blue' },
        ],
    },
    {
        label: 'education',
        children: [
            { label: 'high-school', href: '/about#education', dot: 'dot-grey' },
            { label: 'university',  href: '/about#education', dot: 'dot-grey' },
        ],
    },
    {
        label: 'contacts',
        children: [
            { label: 'lam@example.com', href: 'mailto:lam@example.com', icon: '✉' },
            { label: '+84 000 000 000', href: 'tel:+84000000000',       icon: '📞' },
        ],
    },
    ]

    const HOBBIES: SidebarGroup[] = [
    {
        label: 'music',
        children: [
            { label: 'lo-fi',        href: '#', dot: 'dot-teal'  },
            { label: 'indie',        href: '#', dot: 'dot-blue'  },
        ],
    },
    {
        label: 'games',
        children: [
            { label: 'strategy',     href: '#', dot: 'dot-red'   },
            { label: 'indie-games',  href: '#', dot: 'dot-green' },
        ],
    },
    {
        label: 'reading',
        children: [
            { label: 'tech-books',   href: '#', dot: 'dot-amber' },
            { label: 'sci-fi',       href: '#', dot: 'dot-grey'  },
        ],
    },
]

const PANEL_DATA: Record<ActivityPanel, SidebarGroup[]> = {
    professional: PROFESSIONAL,
    personal:     PERSONAL,
    hobbies:      HOBBIES,
}

const PANEL_LABEL: Record<ActivityPanel, string> = {
    professional: 'professional-info',
    personal:     'personal-info',
    hobbies:      'hobbies',
}

// ── Component ─────────────────────────────────────────────────

interface Props {
    active: ActivityPanel
}

export function AboutSidebar({ active }: Props) {
    const groups = PANEL_DATA[active]

    return (
        <aside className="w-56 shrink-0 flex flex-col border-r border-(--border-muted) bg-(--bg-sidebar) overflow-y-auto">

        {/* Panel label */}
        <header className="px-4 py-2 border-b border-(--border-muted) shrink-0">
            <span className="font-mono text-[11px] text-(--text-secondary) uppercase tracking-widest">
            {PANEL_LABEL[active]}
            </span>
        </header>

        {/* Groups */}
        <nav className="flex flex-col px-2 py-2 gap-1">
            {groups.map((group) => (
            <div key={group.label}>

                {/* Group header */}
                <div className="flex items-center gap-2 px-2 py-1">
                <span className="font-mono text-[11px] text-(--text-muted)">▾</span>
                <span className="font-mono text-[13px] text-(--text-primary)">{group.label}</span>
                </div>

                {/* Children */}
                {group.children.map((child) => (
                <a
                    key={child.label}
                    href={child.href}
                    title={child.label}
                    target={child.external ? '_blank' : undefined}
                    rel={child.external ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 pl-7 pr-2 py-1 rounded-sm font-mono text-[13px] text-(--text-muted) hover:bg-(--bg-elevated) hover:text-(--text-primary) transition-colors duration-100"
                >
                    {child.dot && <span className={`sidebar-dot ${child.dot}`} />}
                    {child.icon && <span className="text-[12px]">{child.icon}</span>}
                    <span>{child.label}</span>
                </a>
                ))}

            </div>
            ))}
        </nav>

        </aside>
    )
}