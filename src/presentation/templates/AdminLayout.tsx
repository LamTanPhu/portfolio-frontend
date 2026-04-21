export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r p-4 text-sm flex flex-col gap-2">
        <span className="font-medium mb-2">Admin</span>
        <a href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</a>
        <a href="/admin/projects" className="text-muted-foreground hover:text-foreground">Projects</a>
        <a href="/admin/blog" className="text-muted-foreground hover:text-foreground">Blog</a>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
