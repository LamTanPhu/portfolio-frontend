// app/admin/(protected)/social/[id]/edit/page.tsx
import { AdminSocialEditPage } from '@/src/presentation/pages/AdminSocialEditPage'

interface Params {
    id: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { id } = await params
    return <AdminSocialEditPage id={Number(id)} />
}
