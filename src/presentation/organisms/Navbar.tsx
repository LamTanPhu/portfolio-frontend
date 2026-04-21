import Link from 'next/link'

const links = [
  { href: '/', label: '_hello' },
  { href: '/about', label: '_about-me' },
  { href: '/projects', label: '_projects' },
  { href: '/contact', label: '_contact-me' },
]

export function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b px-6 h-12 text-sm">
      <span className="font-medium">lam-tan-phu</span>
      <div className="flex gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
