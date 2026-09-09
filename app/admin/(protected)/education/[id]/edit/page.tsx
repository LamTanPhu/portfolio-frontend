// app/admin/(protected)/education/[id]/edit/page.tsx
import { AdminEducationEditPage } from '@/src/presentation/pages/AdminEducationEditPage'

interface Params {
    id: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { id } = await params
    return <AdminEducationEditPage id={Number(id)} />
}
