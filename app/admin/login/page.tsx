// app/admin/login/page.tsx
import { AdminLoginPage } from '@/src/presentation/pages/adminPages/AdminLoginPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title:  'Admin Login',
    robots: { index: false, follow: false },
}

export default function Page() {
    return <AdminLoginPage />
}
