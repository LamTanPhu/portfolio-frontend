// app/admin/(protected)/projects/[slug]/edit/page.tsx
// Server Component — fetches via the existing public loadProjectBySlug.
// Only reaches published projects (see AdminProjectFormPage's note on
// VisibilityWarning) since GET /projects/:slug only ever resolves those.
import { notFound } from 'next/navigation'
import { AdminProjectFormPage } from '@/src/presentation/pages/AdminProjectFormPage'
import { loadProjectBySlug } from '@/src/application/use-cases/queries/project/loadProjectBySlug'

interface Params {
    slug: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { slug } = await params
    const project = await loadProjectBySlug(slug)

    if (!project) notFound()

    return <AdminProjectFormPage mode="edit" project={project} />
}
