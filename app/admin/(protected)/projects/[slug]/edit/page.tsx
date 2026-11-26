// app/admin/(protected)/projects/[slug]/edit/page.tsx
// Thin route wrapper. The project is loaded client-side by AdminProjectEditPage
// through the JWT-guarded GET /projects/admin/:slug — the public
// GET /projects/:slug 404s on drafts, and a Server Component has no access token
// to call the admin route.
import { AdminProjectEditPage } from '@/src/presentation/pages/adminPages/AdminProjectEditPage'

interface Params {
    slug: string
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { slug } = await params
    return <AdminProjectEditPage slug={slug} />
}
