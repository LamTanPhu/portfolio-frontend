import { Sidebar } from '../organisms/Sidebar'
import { TabBar } from '../organisms/TabBar'
import { StatusBar } from '../organisms/StatusBar'
import type { Tab } from '../organisms/TabBar'
import type { ReactNode } from 'react'

// =============================================================================
// VSCodeLayout — Template
// Shell for every page. TabBar top, StatusBar bottom.
// Sidebar is optional — home page passes showSidebar={false}.
// =============================================================================

const TABS: Tab[] = [
  { id: 'hello',    label: '_hello',       href: '/'        },
  { id: 'about',    label: '_about-me',    href: '/about'   },
  { id: 'projects', label: '_projects',    href: '/projects'},
  { id: 'blog',     label: '_blog',        href: '/blog'    },
  { id: 'contact',  label: '_contact-me',  href: '/contact' },
]

const SIDEBAR_ITEMS = [
  {
    label: 'personal-info',
    href: '#',
    children: [
      { label: 'bio',       href: '/about'           },
      { label: 'interests', href: '/about#interests' },
    ],
  },
  { label: 'projects', href: '/projects' },
  { label: 'blog',     href: '/blog'     },
  { label: 'contact',  href: '/contact'  },
]

interface Props {
  children:     ReactNode
  activeTab:    string
  showSidebar?: boolean
}

export function VSCodeLayout({ children, activeTab, showSidebar = true }: Props) {
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
    >
      {/* ── Tab bar ─────────────────────────────────────── */}
      <TabBar
        tabs={TABS}
        activeId={activeTab}
        ownerName="lam-tan-phu"
      />

      {/* ── Body ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {showSidebar && (
          <Sidebar ownerName="lam-tan-phu" items={SIDEBAR_ITEMS} />
        )}

        {/* Main content — glow-bg applies teal atmosphere */}
        <main className="flex-1 overflow-y-auto glow-bg">
          {children}
        </main>

      </div>

      {/* ── Status bar ──────────────────────────────────── */}
      <StatusBar />
    </div>
  )
}