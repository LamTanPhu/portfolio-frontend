import { SnakeGame } from '../organisms/SnakeGame';
import { VSCodeLayout } from '../templates/VSCodeLayout'
import type { ReactNode } from 'react'
import type { SocialAccountDTO } from '@/src/application/dtos/SocialAccountDTO'
import type { SocialLink } from '../organisms/StatusBar'

// =============================================================================
// HomePage — Page
// Left:  developer.ts identity panel
// Right: Snake game
//
// `socialAccounts` is fetched server-side in app/page.tsx (via
// loadSocialAccounts()) and mapped into StatusBar's footer links. Spotify
// now-playing needs no wiring here — NowPlaying already polls the backend
// directly and renders in every page's StatusBar.
// =============================================================================

function toSocialLink(account: SocialAccountDTO): SocialLink {
  return { label: account.name, href: account.url, imageUrl: account.imageUrl }
}

interface Props {
  socialAccounts: SocialAccountDTO[]
}

export function HomePage({ socialAccounts }: Props) {
  const socials = socialAccounts.length > 0
    ? socialAccounts.map(toSocialLink)
    : undefined // falls back to StatusBar's own defaults

  return (
    <VSCodeLayout activeTab="hello" showSidebar={false} socials={socials}>
      <div className="flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full max-w-6xl">

          {/* ── Left — identity block ─────────────────────────── */}
          <section className="flex flex-col gap-4 lg:flex-1">

            <p className="font-mono text-sm text-(--text-comment)">
              Hi all. I am
            </p>

            <h1 className="font-mono font-bold leading-tight text-[clamp(2rem,5vw,3.5rem)] text-(--text-primary)">
              Lam Tan Phu
            </h1>

            <p className="font-mono text-lg text-(--accent-teal)">
              {'>'} Full-stack Developer
            </p>

            {/* developer.ts panel */}
            <div className="mt-4 rounded-sm overflow-hidden border border-(--border-muted) bg-[rgba(1,22,39,0.7)] backdrop-blur-sm">

              {/* title bar */}
              <header className="flex items-center gap-2 px-4 py-2 border-b border-(--border-subtle) bg-[rgba(1,13,24,0.8)]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="font-mono text-xs ml-2 text-(--text-muted)">
                  developer.ts
                </span>
              </header>

              {/* code body */}
              <div className="p-5 font-mono text-sm leading-relaxed">
                <CodeLine><Kw>const </Kw><Co>developer</Co><Pl> = {'{'}</Pl></CodeLine>
                <CodeLine indent={1}><Pr>name</Pr><Pl>:      </Pl><St>&quot;Lam Tan Phu&quot;</St><Pl>,</Pl></CodeLine>
                <CodeLine indent={1}><Pr>role</Pr><Pl>:      </Pl><St>&quot;Full-stack Developer&quot;</St><Pl>,</Pl></CodeLine>
                <CodeLine indent={1}><Pr>skills</Pr><Pl>:    [</Pl></CodeLine>
                <CodeLine indent={2}><St>&quot;TypeScript&quot;</St><Pl>, </Pl><St>&quot;React&quot;</St><Pl>,</Pl></CodeLine>
                <CodeLine indent={2}><St>&quot;Node.js&quot;</St><Pl>,  </Pl><St>&quot;PostgreSQL&quot;</St><Pl>,</Pl></CodeLine>
                <CodeLine indent={1}><Pl>],</Pl></CodeLine>
                <CodeLine indent={1}><Pr>available</Pr><Pl>: </Pl><Kw>true</Kw><Pl>,</Pl></CodeLine>
                <CodeLine><Pl>{'}'}</Pl></CodeLine>
              </div>
            </div>

            {/* GitHub link */}
            <div className="flex flex-col gap-1 mt-2">
              <p className="font-mono text-sm text-(--text-comment)">
                // find my profile on Github:
              </p>
              <p className="font-mono text-sm">
                <Kw>const </Kw>
                <Co>githubLink</Co>
                <Pl> = </Pl>
                <a
                  href="https://github.com/lam-tan-phu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--text-string) underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  &quot;https://github.com/lam-tan-phu&quot;
                </a>
              </p>
            </div>

          </section>

          {/* ── Right — Snake game ────────────────────────────── */}
          <div className="shrink-0">
            <SnakeGame />
          </div>

        </div>
      </div>
    </VSCodeLayout>
  )
}

// =============================================================================
// Syntax highlight helpers — Tailwind CSS var classes, zero inline styles
// =============================================================================
function CodeLine({ children, indent = 0 }: { children: ReactNode; indent?: number }) {
  const levels: Record<number, string> = { 0: '', 1: 'pl-6', 2: 'pl-12' }
  return <div className={levels[indent] ?? ''}>{children}</div>
}
function Kw({ children }: { children: ReactNode }) { return <span className="text-(--text-keyword)"  >{children}</span> }
function Co({ children }: { children: ReactNode }) { return <span className="text-(--text-const)"    >{children}</span> }
function Pr({ children }: { children: ReactNode }) { return <span className="text-(--text-secondary)">{children}</span> }
function St({ children }: { children: ReactNode }) { return <span className="text-(--text-string)"   >{children}</span> }
function Pl({ children }: { children: ReactNode }) { return <span className="text-(--text-primary)"  >{children}</span> }