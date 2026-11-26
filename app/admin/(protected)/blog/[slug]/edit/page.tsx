// app/admin/(protected)/blog/[slug]/edit/page.tsx
// Thin route wrapper. The post is loaded client-side by AdminBlogEditPage through
// the JWT-guarded GET /blogs/admin/:slug — the public GET /blogs/:slug 404s on
// drafts, and a Server Component has no access token to call the admin route.
import { AdminBlogEditPage } from '@/src/presentation/pages/adminPages/AdminBlogEditPage'

interface Params {
    slug: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { slug } = await params
    return <AdminBlogEditPage slug={slug} />
}
