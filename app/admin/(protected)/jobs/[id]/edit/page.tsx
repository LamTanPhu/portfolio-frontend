// app/admin/(protected)/jobs/[id]/edit/page.tsx
import { AdminJobEditPage } from '@/src/presentation/pages/AdminJobEditPage'

interface Params {
    id: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { id } = await params
    return <AdminJobEditPage id={Number(id)} />
}
