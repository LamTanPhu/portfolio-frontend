// app/admin/(protected)/layout.tsx
// Route group — applies AdminShell's gate to every admin page except
// /admin/login, which lives outside this group specifically to avoid it.
import { AdminShell } from '@/src/presentation/templates/AdminShell'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
    return <AdminShell>{children}</AdminShell>
}
