'use client'
import { NavTab } from '../atoms/NavTab'

// =============================================================================
// TabBar — Organism
// Owner name static label far left, _contact-me pushed far right.
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

const CONTACT_ID = 'contact'

export function TabBar({ tabs, activeId, ownerName }: Props) {
  const leftTabs  = tabs.filter((t) => t.id !== CONTACT_ID)
  const rightTabs = tabs.filter((t) => t.id === CONTACT_ID)

  return (
    <div className="flex items-stretch min-h-10 shrink-0 border-b border-(--border-subtle) bg-(--bg-tab-bar)">

      {/* Owner name — static branding */}
      <div className="flex items-center px-5 border-r border-(--border-muted)">
        <span className="font-mono text-xs text-(--text-muted) tracking-wide whitespace-nowrap">
          {ownerName}
        </span>
      </div>

      {/* Left nav tabs */}
      <div className="flex items-stretch overflow-x-auto">
        {leftTabs.map((tab) => (
          <a key={tab.id} href={tab.href} title={tab.label} className="flex items-stretch">
            <NavTab label={tab.label} isActive={tab.id === activeId} />
          </a>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Contact tab — far right */}
      <div className="flex items-stretch border-l border-(--border-muted)">
        {rightTabs.map((tab) => (
          <a key={tab.id} href={tab.href} title={tab.label} className="flex items-stretch">
            <NavTab label={tab.label} isActive={tab.id === activeId} />
          </a>
        ))}
      </div>
    </div>
  )
}