import { Sidebar }             from '../organisms/Sidebar'
import { TabBar }              from '../organisms/TabBar'
import { StatusBar }           from '../organisms/StatusBar'
import type { Tab }            from '../organisms/TabBar'
import type { SidebarItem }    from '../organisms/Sidebar'
import type { SocialLink }     from '../organisms/StatusBar'
import type { ReactNode }      from 'react'

// =============================================================================
// VSCodeLayout — Template
// Shell for every page. TabBar top, StatusBar bottom.
// Each page passes its own sidebarItems — layout stays dumb.
// showSidebar defaults to true — home passes false.
// socials is optional — StatusBar falls back to its own defaults when the
// caller doesn't have real data to hand yet (only Home fetches it today).
// =============================================================================

const TABS: Tab[] = [
  { id: 'hello',    label: '_hello',      href: '/'         },
  { id: 'about',    label: '_about-me',   href: '/about'    },
  { id: 'projects', label: '_projects',   href: '/projects' },
  { id: 'blog',     label: '_blog',       href: '/blog'     },
  { id: 'contact',  label: '_contact-me', href: '/contact'  },
]

interface Props {
  children:      ReactNode
  activeTab:     string
  showSidebar?:  boolean
  sidebarItems?: SidebarItem[]
  socials?:      SocialLink[]
}

export function VSCodeLayout({
  children,
  activeTab,
  showSidebar  = true,
  sidebarItems = [],
  socials,
}: Props) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-(--bg-surface) text-(--text-primary)">

      <TabBar tabs={TABS} activeId={activeTab} ownerName="lam-tan-phu" />

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar ownerName="lam-tan-phu" items={sidebarItems} />
        )}
        <main className="flex-1 overflow-y-auto glow-bg">
          {children}
        </main>
      </div>

      <StatusBar {...(socials ? { socials } : {})} />
    </div>
  )
}