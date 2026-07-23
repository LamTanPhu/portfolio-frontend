'use client'
import type { CertificationDTO } from '@/src/application/dtos/certification/CertificationDTO'
import type { EducationDTO } from '@/src/application/dtos/education/EducationDTO'
import type { JobDTO } from '@/src/application/dtos/job/JobDTO'
import type { SkillDTO } from '@/src/application/dtos/skill/SkillDTO'
import { useState } from 'react'
import { AboutSidebar } from '../organisms/about/AboutSideBar'
import type { ActivityPanel } from '../organisms/about/ActivityBar'
import { ActivityBar } from '../organisms/about/ActivityBar'
import { VSCodeLayout } from '../templates/VSCodeLayout'

// =============================================================================
// AboutPage — Page
// Has its own activity bar + switchable sidebar — does not use VSCodeLayout
// sidebar. Layout sidebar is hidden, about-specific sidebar renders instead.
//
// skills/education/jobs/certifications are fetched server-side in
// app/about/page.tsx and passed in as props — same pattern as ProjectsPage.
// Bio text and code snippets below stay static; there's no backend model for
// them yet.
// =============================================================================

const BIO_LINES = [
  '/**',
  ' * About me',
  ' *',
  " * I'm Lam Tan Phu — a full-stack developer",
  ' * based in Vietnam.',
  ' *',
  ' * I enjoy building clean, well-structured',
  ' * software that lives on the internet.',
  ' *',
  ' * Currently focused on TypeScript, React,',
  ' * and Node.js — always learning something new.',
  ' *',
  " * When I'm not coding, I'm probably",
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
      { n: 1, code: 'const stack = {',                                type: 'plain'  },
      { n: 2, code: '  frontend: ["React", "Next.js", "Tailwind"],',  type: 'string' },
      { n: 3, code: '  backend:  ["Node.js", "Express", "Hono"],',    type: 'string' },
      { n: 4, code: '  database: ["PostgreSQL", "Redis"],',           type: 'string' },
      { n: 5, code: '  infra:    ["Docker", "Cloudflare"],',          type: 'string' },
      { n: 6, code: '}',                                              type: 'plain'  },
    ],
  },
  {
    id:       2,
    filename: 'interests.ts',
    stars:    2,
    age:      '5 months ago',
    lines: [
      { n: 1, code: 'const interests = [',       type: 'plain'  },
      { n: 2, code: '  "clean architecture",',   type: 'string' },
      { n: 3, code: '  "developer experience",', type: 'string' },
      { n: 4, code: '  "ui design systems",',    type: 'string' },
      { n: 5, code: '  "open source",',          type: 'string' },
      { n: 6, code: ']',                         type: 'plain'  },
    ],
  },
]

interface Props {
  skills:         SkillDTO[]
  education:      EducationDTO[]
  jobs:           JobDTO[]
  certifications: CertificationDTO[]
}

export function AboutPage({ skills, education, jobs, certifications }: Props) {
  const [activePanel, setActivePanel] = useState<ActivityPanel>('personal')

  return (
    <VSCodeLayout activeTab="about" showSidebar={false}>
      <div className="flex h-full overflow-hidden">

        {/* Activity bar — leftmost icon strip */}
        <ActivityBar active={activePanel} onChange={setActivePanel} />

        {/* Switchable sidebar */}
        <AboutSidebar
          active={activePanel}
          skills={skills}
          education={education}
          jobs={jobs}
          certifications={certifications}
        />

        {/* ── Editor panel ─────────────────────────────────── */}
        <section className="w-[45%] flex flex-col border-r border-(--border-muted) overflow-hidden bg-[rgba(1,13,24,0.4)]">

          {/* Editor tab */}
          <header className="flex items-center shrink-0 border-b border-(--border-muted) bg-(--bg-tab-bar)">
            <div className="flex items-center gap-2 px-5 py-2.5 border-r border-(--border-muted) bg-(--bg-tab-active)">
              <span className="font-mono text-xs text-(--text-primary)">about-me.ts</span>
              <span className="font-mono text-[10px] text-(--text-muted) ml-1">✕</span>
            </div>
          </header>

          {/* Code + line numbers */}
          <div className="flex overflow-y-auto flex-1">
            <div className="flex flex-col pt-6 pb-6 px-4 shrink-0 select-none border-r border-(--border-subtle) bg-[rgba(1,13,24,0.3)]">
              {BIO_LINES.map((_, i) => (
                <span key={i} className="font-mono text-sm text-(--text-muted) leading-7 text-right min-w-6">
                  {i + 1}
                </span>
              ))}
            </div>
            <div className="flex flex-col pt-6 pb-6 px-8 overflow-x-auto">
              {BIO_LINES.map((line, i) => (
                <span key={i} className="font-mono text-sm text-(--text-comment) leading-7 whitespace-pre">
                  {line}
                </span>
              ))}
            </div>
          </div>

        </section>

        {/* ── Snippet showcase ─────────────────────────────── */}
        <section className="flex-1 flex flex-col gap-5 p-6 overflow-y-auto">
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
// Types + SnippetCard
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
    <article className="flex flex-col rounded-lg border border-(--border-muted) bg-[rgba(1,13,24,0.7)] overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-(--border-subtle) bg-[rgba(1,13,24,0.4)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-(--accent-teal)" />
          <span className="font-mono text-xs text-(--text-secondary)">@lam-tan-phu</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] text-(--text-muted)">{snippet.age}</span>
          <span className="font-mono text-[11px] text-(--text-muted)">★ {snippet.stars}</span>
        </div>
      </header>
      <div className="px-5 py-4 flex flex-col gap-0.5">
        {snippet.lines.map((line) => (
          <div key={line.n} className="flex gap-5">
            <span className="font-mono text-xs text-(--text-muted) select-none w-4 text-right shrink-0 leading-6">
              {line.n}
            </span>
            <span className={[
              'font-mono text-xs leading-6 whitespace-pre',
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