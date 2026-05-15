interface SidebarItem {
  label: string; href: string; children?: SidebarItem[]
}

interface Props { ownerName: string; items: SidebarItem[] }

export function Sidebar({ ownerName, items }: Props) {
  return (
    <aside className="w-52 shrink-0 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
      <div className="px-4 py-2 border-b border-[#3c3c3c]">
        <span className="font-mono text-[11px] text-[#bbbbbb] uppercase tracking-wider">Explorer</span>
      </div>
      <div className="px-2 py-1">
        <div className="font-mono text-[11px] text-[#cccccc] px-2 py-1 uppercase tracking-wider">{ownerName}</div>
        <nav className="flex flex-col">
          {items.map(item => (
            <div key={item.label}>
              <a href={item.href} className="flex items-center gap-1 px-2 py-0.5 font-mono text-[13px] text-[#cccccc] hover:bg-[#2a2d2e] rounded-sm">
                {item.children ? '▾' : '·'} {item.label}
              </a>
              {item.children?.map(child => (
                <a key={child.label} href={child.href} className="flex items-center gap-1 pl-6 pr-2 py-0.5 font-mono text-[13px] text-[#cccccc] hover:bg-[#2a2d2e] rounded-sm">
                  {child.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
