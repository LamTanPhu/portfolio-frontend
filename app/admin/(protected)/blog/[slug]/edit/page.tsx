// app/admin/(protected)/blog/[slug]/edit/page.tsx
// Server Component — fetches via the existing public loadBlogBySlug (the
// backend's GET /blogs/:slug doesn't filter by isPublished, so this works
// for drafts too), passes the result into the client form.
import { loadBlogBySlug } from '@/src/application/use-cases/queries/blog/loadBlogBySlug'
import { AdminBlogFormPage } from '@/src/presentation/pages/adminPages/AdminBlogFormPage'
import { notFound } from 'next/navigation'

interface Params {
    slug: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { slug } = await params
    const post = await loadBlogBySlug(slug)

    if (!post) notFound()

    return <AdminBlogFormPage mode="edit" post={post} />
}
