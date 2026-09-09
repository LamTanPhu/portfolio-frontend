// app/admin/(protected)/skills/[id]/edit/page.tsx
import { AdminSkillEditPage } from '@/src/presentation/pages/AdminSkillEditPage'

interface Params {
    id: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { id } = await params
    return <AdminSkillEditPage id={Number(id)} />
}
