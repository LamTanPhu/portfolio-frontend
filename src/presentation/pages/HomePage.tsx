import { SnakeGame } from '../atoms/SnakeGame';
import { VSCodeLayout } from '../templates/VSCodeLayout';

// =============================================================================
// HomePage — Page
// Left:  developer.ts code panel (intro / identity)
// Right: Snake game
// =============================================================================

export function HomePage() {
  return (
    <VSCodeLayout activeTab="hello" showSidebar={false}>
      <div className="flex items-center justify-center h-full px-8 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full max-w-6xl">

          {/* ── Left — developer.ts code panel ───────────────── */}
          <div className="flex flex-col gap-4 lg:flex-1">

            <p className="font-mono text-sm" style={{ color: 'var(--text-comment)' }}>
              Hi all. I am
            </p>

            <h1
              className="font-mono font-bold leading-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                color:    'var(--text-primary)',
              }}
            >
              Lam Tan Phu
            </h1>

            <p className="font-mono text-lg" style={{ color: 'var(--accent-teal)' }}>
              {'>'} Full-stack Developer
            </p>

            {/* developer object */}
            <div
              className="mt-4 rounded-sm overflow-hidden"
              style={{
                border:          '1px solid var(--border-muted)',
                backgroundColor: 'rgba(1, 22, 39, 0.7)',
                backdropFilter:  'blur(8px)',
              }}
            >
              {/* title bar */}
              <div
                className="flex items-center gap-2 px-4 py-2 border-b"
                style={{
                  borderColor:     'var(--border-subtle)',
                  backgroundColor: 'rgba(1, 13, 24, 0.8)',
                }}
              >
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="font-mono text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                  developer.ts
                </span>
              </div>

              {/* code */}
              <div className="p-5 font-mono text-sm leading-relaxed">
                <CodeLine><Keyword>const </Keyword><Const>developer</Const><Plain> = {'{'}</Plain></CodeLine>
                <CodeLine indent><Property>name</Property><Plain>:     </Plain><Str>&quot;Lam Tan Phu&quot;</Str><Plain>,</Plain></CodeLine>
                <CodeLine indent><Property>role</Property><Plain>:     </Plain><Str>&quot;Full-stack Developer&quot;</Str><Plain>,</Plain></CodeLine>
                <CodeLine indent><Property>skills</Property><Plain>:   [</Plain></CodeLine>
                <CodeLine indent={2}><Str>&quot;TypeScript&quot;</Str><Plain>, </Plain><Str>&quot;React&quot;</Str><Plain>,</Plain></CodeLine>
                <CodeLine indent={2}><Str>&quot;Node.js&quot;</Str><Plain>,  </Plain><Str>&quot;PostgreSQL&quot;</Str><Plain>,</Plain></CodeLine>
                <CodeLine indent><Plain>],</Plain></CodeLine>
                <CodeLine indent><Property>available</Property><Plain>: </Plain><Keyword>true</Keyword><Plain>,</Plain></CodeLine>
                <CodeLine><Plain>{'}'}</Plain></CodeLine>
              </div>
            </div>

            {/* github link */}
            <div className="flex flex-col gap-1 mt-2">
              <p className="font-mono text-sm" style={{ color: 'var(--text-comment)' }}>
                // find my profile on Github:
              </p>
              <p className="font-mono text-sm">
                <Keyword>const </Keyword>
                <Const>githubLink</Const>
                <Plain> = </Plain>
                <a
                  href="https://github.com/LamTanPhu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-string)' }}
                >
                  &quot;https://github.com/LamTanPhu&quot;
                </a>
              </p>
            </div>
          </div>

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
// Syntax highlight helpers
// =============================================================================
function CodeLine({ children, indent = false }: { children: React.ReactNode; indent?: boolean | number }) {
  const level = indent === true ? 1 : indent === false ? 0 : indent
  return <div style={{ paddingLeft: `${level * 1.5}rem` }}>{children}</div>
}
function Keyword  ({ children }: { children: React.ReactNode }) { return <span style={{ color: 'var(--text-keyword)'   }}>{children}</span> }
function Const    ({ children }: { children: React.ReactNode }) { return <span style={{ color: 'var(--text-const)'     }}>{children}</span> }
function Property ({ children }: { children: React.ReactNode }) { return <span style={{ color: 'var(--text-secondary)' }}>{children}</span> }
function Str      ({ children }: { children: React.ReactNode }) { return <span style={{ color: 'var(--text-string)'    }}>{children}</span> }
function Plain    ({ children }: { children: React.ReactNode }) { return <span style={{ color: 'var(--text-primary)'   }}>{children}</span> }