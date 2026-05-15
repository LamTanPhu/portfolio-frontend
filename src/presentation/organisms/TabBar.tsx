'use client'
import { NavTab } from '../atoms/NavTab'

// =============================================================================
// TabBar — Organism
// Owner name is a static non-clickable label on the far left (like the
// VS Code "michael-weaver" branding tab).
// _contact-me is pushed to the far right.
// Active tab gets an amber bottom border.
// =============================================================================

export interface Tab {
  id:    string
  label: string
  href:  string
}

interface Props {
  tabs:      Tab[]
  activeId:  string
  ownerName: string
}

// Split tabs: everything except contact goes left, contact goes right
const CONTACT_ID = 'contact'

export function TabBar({ tabs, activeId, ownerName }: Props) {
  const leftTabs  = tabs.filter((t) => t.id !== CONTACT_ID)
  const rightTabs = tabs.filter((t) => t.id === CONTACT_ID)

  return (
    <div
      className="flex items-stretch border-b border-[var(--border-subtle)] bg-[var(--bg-tab-bar)] shrink-0"
      style={{ minHeight: '40px' }}
    >
      {/* Owner name — static branding, not a link */}
      <div className="flex items-center px-5 border-r border-[var(--border-subtle)]">
        <span className="font-mono text-xs text-[var(--text-muted)] tracking-wide whitespace-nowrap">
          {ownerName}
        </span>
      </div>

      {/* Left nav tabs */}
      <div className="flex items-stretch overflow-x-auto">
        {leftTabs.map((tab) => (
          <a key={tab.id} href={tab.href} className="flex items-stretch">
            <NavTab label={tab.label} isActive={tab.id === activeId} />
          </a>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1 border-b border-[var(--border-subtle)]" />

      {/* Right — contact tab pushed far right */}
      <div className="flex items-stretch border-l border-[var(--border-subtle)]">
        {rightTabs.map((tab) => (
          <a key={tab.id} href={tab.href} className="flex items-stretch">
            <NavTab label={tab.label} isActive={tab.id === activeId} />
          </a>
        ))}
      </div>
    </div>
  )
}