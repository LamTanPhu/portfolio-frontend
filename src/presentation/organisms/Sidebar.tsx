// =============================================================================
// Sidebar — Organism
// VS Code explorer panel. Sidebar items are passed per-page —
// this component just renders whatever structure it receives.
// =============================================================================

export interface SidebarItem {
  label:     string
  href:      string
  // Dot color class from globals.css — e.g. 'dot-red', 'dot-blue', 'dot-teal'
  dot?:      string
  // Optional icon character or emoji
  icon?:     string
  // Inline meta shown below label (email, phone etc.)
  meta?:     string
  // Open in new tab
  external?: boolean
  children?: SidebarItem[]
}

interface Props {
  ownerName: string
  items:     SidebarItem[]
}

export function Sidebar({ ownerName, items }: Props) {
  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-(--border-muted) bg-(--bg-sidebar) overflow-y-auto">

      {/* Explorer header */}
      <header className="px-4 py-2 border-b border-(--border-muted) shrink-0">
        <span className="font-mono text-[11px] text-(--text-muted) uppercase tracking-widest">
          Explorer
        </span>
      </header>

      {/* Owner name */}
      <div className="px-4 py-2 border-b border-(--border-subtle) shrink-0">
        <span className="font-mono text-[11px] text-(--text-secondary) uppercase tracking-widest">
          {ownerName}
        </span>
      </div>

      {/* Nav tree */}
      <nav className="flex flex-col px-2 py-2 gap-0.5">
        {items.map((item) => (
          <SidebarSection key={item.label} item={item} />
        ))}
      </nav>

    </aside>
  )
}

// =============================================================================
// SidebarSection — renders a top-level item + its children
// =============================================================================
function SidebarSection({ item }: { item: SidebarItem }) {
  return (
    <div>
      {/* Parent row */}
      <a
        href={item.href}
        title={item.label}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        className="flex items-center gap-2 px-2 py-1 rounded-sm font-mono text-[13px] text-(--text-primary) hover:bg-(--bg-elevated) transition-colors duration-100"
      >
        {/* Expand chevron or dot */}
        <span className="text-(--text-muted) text-[10px] w-3 shrink-0">
          {item.children ? '▾' : '·'}
        </span>

        {/* Optional color dot */}
        {item.dot && (
          <span className={`sidebar-dot ${item.dot}`} />
        )}

        {/* Optional icon */}
        {item.icon && (
          <span className="text-[13px] shrink-0">{item.icon}</span>
        )}

        <span>{item.label}</span>
      </a>

      {/* Optional meta (email, phone) */}
      {item.meta && (
        <p className="font-mono text-[11px] text-(--text-muted) pl-8 pb-1">
          {item.meta}
        </p>
      )}

      {/* Children */}
      {item.children?.map((child) => (
        <SidebarChild key={child.label} item={child} />
      ))}
    </div>
  )
}

// =============================================================================
// SidebarChild — indented child row
// =============================================================================
function SidebarChild({ item }: { item: SidebarItem }) {
  return (
    <div>
      <a
        href={item.href}
        title={item.label}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        className="flex items-center gap-2 pl-7 pr-2 py-1 rounded-sm font-mono text-[13px] text-(--text-muted) hover:bg-(--bg-elevated) hover:text-(--text-primary) transition-colors duration-100"
      >
        {/* Optional color dot */}
        {item.dot && (
          <span className={`sidebar-dot ${item.dot}`} />
        )}

        {/* Optional icon */}
        {item.icon && (
          <span className="text-[13px] shrink-0">{item.icon}</span>
        )}

        <span>{item.label}</span>
      </a>

      {/* Optional meta */}
      {item.meta && (
        <p className="font-mono text-[11px] text-(--text-muted) pl-12 pb-1">
          {item.meta}
        </p>
      )}
    </div>
  )
}