import { VSCodeLayout } from '../templates/VSCodeLayout'
import type { SidebarItem } from '../organisms/Sidebar'
import type { ReactNode } from 'react'

// =============================================================================
// AboutPage — Page
// Left:  fake code editor with line numbers, bio as JSDoc
// Right: code snippet showcase cards
// =============================================================================

const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        label: 'personal-info',
        href:  '#',
        children: [
            { label: 'bio',       href: '/about',           dot: 'dot-red'  },
            { label: 'interests', href: '/about#interests', dot: 'dot-blue' },
        ],
    },
    {
        label: 'education',
        href:  '#',
        children: [
            { label: 'high-school', href: '/about#education', dot: 'dot-grey' },
            { label: 'university',  href: '/about#education', dot: 'dot-grey' },
        ],
    },
    {
        label:    'contacts',
        href:     '#',
        children: [
            { label: 'lam@example.com', href: 'mailto:lam@example.com', icon: '✉' },
            { label: '+84 000 000 000', href: 'tel:+84000000000',       icon: '📞' },
        ],
    },
]

const BIO_LINES = [
    '/**',
    ' * About me',
    ' *',
    ' * I\'m Lam Tan Phu — a full-stack developer',
    ' * based in Vietnam.',
    ' *',
    ' * I enjoy building clean, well-structured',
    ' * software that lives on the internet.',
    ' *',
    ' * Currently focused on TypeScript, React,',
    ' * and Node.js — always learning something new.',
    ' *',
    ' * When I\'m not coding, I\'m probably',
    ' * thinking about coding.',
    ' *',
    ' */',
]

const SNIPPETS: Snippet[] = [
    {
        id:       1,
        filename: 'stack.ts',
        stars:    4,
        age:      '2 months ago',
        lines: [
        { n: 1,  code: 'const stack = {',                               type: 'plain'   },
        { n: 2,  code: '  frontend: ["React", "Next.js", "Tailwind"],', type: 'string'  },
        { n: 3,  code: '  backend:  ["Node.js", "Express", "Hono"],',   type: 'string'  },
        { n: 4,  code: '  database: ["PostgreSQL", "Redis"],',          type: 'string'  },
        { n: 5,  code: '  infra:    ["Docker", "Cloudflare"],',         type: 'string'  },
        { n: 6,  code: '}',                                             type: 'plain'   },
        ],
    },
    {
        id:       2,
        filename: 'interests.ts',
        stars:    2,
        age:      '5 months ago',
        lines: [
        { n: 1,  code: 'const interests = [',        type: 'plain'  },
        { n: 2,  code: '  "clean architecture",',    type: 'string' },
        { n: 3,  code: '  "developer experience",',  type: 'string' },
        { n: 4,  code: '  "ui design systems",',     type: 'string' },
        { n: 5,  code: '  "open source",',           type: 'string' },
        { n: 6,  code: ']',                          type: 'plain'  },
        ],
    },
]

export function AboutPage() {
    return (
        <VSCodeLayout activeTab="about" sidebarItems={SIDEBAR_ITEMS}>
        <div className="flex h-full">

            {/* ── Left — code editor panel ─────────────────────── */}
            <section className="flex-1 flex flex-col border-r border-(--border-muted) overflow-y-auto">

            {/* Editor tab bar */}
            <header className="flex items-center border-b border-(--border-muted) bg-(--bg-tab-bar) shrink-0">
                <div className="flex items-center gap-2 px-4 py-2 border-r border-(--border-muted) bg-(--bg-tab-active)">
                <span className="font-mono text-xs text-(--text-primary)">about-me.ts</span>
                <button className="text-(--text-muted) hover:text-(--text-primary) text-[10px]">✕</button>
                </div>
            </header>

            {/* Code with line numbers */}
            <div className="flex flex-1 p-0">
                {/* Line numbers */}
                <div className="flex flex-col px-4 py-6 border-r border-(--border-subtle) shrink-0 select-none">
                {BIO_LINES.map((_, i) => (
                    <span key={i} className="font-mono text-xs text-(--text-muted) leading-6 text-right w-6">
                    {i + 1}
                    </span>
                ))}
                </div>

                {/* Code content */}
                <div className="flex flex-col px-6 py-6">
                {BIO_LINES.map((line, i) => (
                    <span key={i} className="font-mono text-xs text-(--text-comment) leading-6 whitespace-pre">
                    {line}
                    </span>
                ))}
                </div>
            </div>

            </section>

            {/* ── Right — snippet showcase ─────────────────────── */}
            <section className="w-96 shrink-0 flex flex-col gap-4 p-6 overflow-y-auto border-l border-(--border-muted)">

            <p className="font-mono text-xs text-(--text-comment) shrink-0">
                // Code snippet showcase:
            </p>

            {SNIPPETS.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
            ))}

            </section>

        </div>
        </VSCodeLayout>
    )
}

// =============================================================================
// SnippetCard — local molecule, about-page specific
// =============================================================================
interface SnippetLine {
    n:    number
    code: string
    type: 'plain' | 'string' | 'keyword'
}

interface Snippet {
    id:       number
    filename: string
    stars:    number
    age:      string
    lines:    SnippetLine[]
}

function SnippetCard({ snippet }: { snippet: Snippet }) {
    return (
        <article className="flex flex-col rounded-lg border border-(--border-muted) bg-[rgba(1,13,24,0.6)] overflow-hidden">

        {/* Card header */}
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-(--border-subtle)">
            <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--accent-teal)" />
            <span className="font-mono text-xs text-(--text-secondary)">@lam-tan-phu</span>
            </div>
            <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-(--text-muted)">{snippet.age}</span>
            <span className="font-mono text-[11px] text-(--text-muted)">★ {snippet.stars}</span>
            </div>
        </header>

        {/* Code block */}
        <div className="px-4 py-3 flex flex-col">
            {snippet.lines.map((line) => (
            <div key={line.n} className="flex gap-4">
                <span className="font-mono text-[11px] text-(--text-muted) select-none w-4 text-right shrink-0 leading-5">
                {line.n}
                </span>
                <span className={[
                'font-mono text-[11px] leading-5',
                line.type === 'string'  ? 'text-(--text-string)'  : '',
                line.type === 'keyword' ? 'text-(--text-keyword)' : '',
                line.type === 'plain'   ? 'text-(--text-primary)' : '',
                ].join(' ')}>
                {line.code}
                </span>
            </div>
            ))}
        </div>

        </article>
    )
}