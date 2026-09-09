// app/admin/(protected)/certifications/[id]/edit/page.tsx
import { AdminCertificationEditPage } from '@/src/presentation/pages/AdminCertificationEditPage'

interface Params {
    id: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { id } = await params
    return <AdminCertificationEditPage id={Number(id)} />
}
