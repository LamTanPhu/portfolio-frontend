import type { ActivityPanel }    from './ActivityBar'
import type { SkillDTO }         from '@/src/application/dtos/SkillDTO'
import type { EducationDTO }     from '@/src/application/dtos/EducationDTO'
import type { JobDTO }           from '@/src/application/dtos/JobDTO'
import type { CertificationDTO } from '@/src/application/dtos/CertificationDTO'

// =============================================================================
// AboutSidebar — Organism (about-page specific)
// Renders different sidebar content based on active activity panel.
//
// "professional" and part of "personal" are now built from real backend data
// (skills/jobs/certifications/education, fetched server-side and passed down
// through AboutPage). Bio, direct contacts, and hobbies have no backend model
// yet, so they stay as static content here.
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

// Cosmetic-only rotation across the dot color classes already defined in
// globals.css — no new design work, just spreading real items across the
// existing palette instead of every row being the same color.
const DOT_ROTATION = ['dot-teal', 'dot-blue', 'dot-green', 'dot-grey', 'dot-amber', 'dot-red']
function dotFor(index: number): string {
    return DOT_ROTATION[index % DOT_ROTATION.length]
}

const SKILL_CATEGORY_DOT: Record<string, string> = {
    frontend: 'dot-teal',
    backend:  'dot-blue',
    devops:   'dot-green',
    database: 'dot-grey',
    other:    'dot-amber',
}

function jobsToGroup(jobs: JobDTO[]): SidebarGroup {
    return {
        label: 'experience',
        children: jobs.map((j) => ({
            label: `${j.role} @ ${j.companyName}`,
            href:  '/about#experience',
            dot:   j.isEnded ? 'dot-grey' : 'dot-teal',
        })),
    }
}

function skillsToGroup(skills: SkillDTO[]): SidebarGroup {
    return {
        label: 'skills',
        children: skills.map((s) => ({
            label: s.name.toLowerCase(),
            href:  '/about#skills',
            dot:   SKILL_CATEGORY_DOT[s.category] ?? 'dot-grey',
        })),
    }
}

function certificationsToGroup(certifications: CertificationDTO[]): SidebarGroup {
    return {
        label: 'certificates',
        children: certifications.map((c, i) => ({
            label:    c.name.toLowerCase(),
            href:     c.url,
            dot:      dotFor(i),
            external: true,
        })),
    }
}

function educationToGroup(education: EducationDTO[]): SidebarGroup {
    return {
        label: 'education',
        children: education.map((e) => ({
            label: `${e.degreeName} — ${e.instituteName}`,
            href:  e.instituteUrl ?? '/about#education',
            dot:   e.isCompleted ? 'dot-grey' : 'dot-teal',
            external: Boolean(e.instituteUrl),
        })),
    }
}

// ── Static groups — no backend model behind these yet ──────────
const PERSONAL_INFO: SidebarGroup = {
    label: 'personal-info',
    children: [
        { label: 'bio',       href: '/about',           dot: 'dot-red'  },
        { label: 'interests', href: '/about#interests', dot: 'dot-blue' },
    ],
}

const CONTACTS: SidebarGroup = {
    label: 'contacts',
    children: [
        { label: 'lam@example.com', href: 'mailto:lam@example.com', icon: '✉' },
        { label: '+84 000 000 000', href: 'tel:+84000000000',       icon: '📞' },
    ],
}

const HOBBIES: SidebarGroup[] = [
    {
        label: 'music',
        children: [
            { label: 'lo-fi', href: '#', dot: 'dot-teal' },
            { label: 'indie', href: '#', dot: 'dot-blue' },
        ],
    },
    {
        label: 'games',
        children: [
            { label: 'strategy',    href: '#', dot: 'dot-red'   },
            { label: 'indie-games', href: '#', dot: 'dot-green' },
        ],
    },
    {
        label: 'reading',
        children: [
            { label: 'tech-books', href: '#', dot: 'dot-amber' },
            { label: 'sci-fi',     href: '#', dot: 'dot-grey'  },
        ],
    },
]

const PANEL_LABEL: Record<ActivityPanel, string> = {
    professional: 'professional-info',
    personal:     'personal-info',
    hobbies:      'hobbies',
}

// ── Component ─────────────────────────────────────────────────

interface Props {
    active:         ActivityPanel
    skills:         SkillDTO[]
    education:      EducationDTO[]
    jobs:           JobDTO[]
    certifications: CertificationDTO[]
}

export function AboutSidebar({ active, skills, education, jobs, certifications }: Props) {
    const panelData: Record<ActivityPanel, SidebarGroup[]> = {
        professional: [jobsToGroup(jobs), skillsToGroup(skills), certificationsToGroup(certifications)],
        personal:     [PERSONAL_INFO, educationToGroup(education), CONTACTS],
        hobbies:      HOBBIES,
    }

    const groups = panelData[active]

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
                {group.children.length === 0 ? (
                    <p className="pl-7 pr-2 py-1 font-mono text-[12px] text-(--text-muted)">
                        // none yet
                    </p>
                ) : (
                    group.children.map((child) => (
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
                    ))
                )}

            </div>
            ))}
        </nav>

        </aside>
    )
}