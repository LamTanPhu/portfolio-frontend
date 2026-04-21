import { Navbar } from '../organisms/Navbar'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t px-6 py-3 text-xs text-muted-foreground text-center">
        find me on: GitHub · LinkedIn
      </footer>
    </div>
  )
}
