// app/admin/login/page.tsx
import type { Metadata } from 'next'
import { AdminLoginPage } from '@/src/presentation/pages/AdminLoginPage'

export const metadata: Metadata = {
    title:  'Admin Login',
    robots: { index: false, follow: false },
}

export default function Page() {
    return <AdminLoginPage />
}
