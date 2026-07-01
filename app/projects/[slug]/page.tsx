// app/projects/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProjectDetailPage } from '@/src/presentation/pages/ProjectDetailPage'
import { loadProjectBySlug } from '@/src/application/use-cases/queries/project/loadProjectBySlug'
import { loadProjects } from '@/src/application/use-cases/queries/project/loadProjects'
import { SITE_URL } from '@/lib/constants'

interface Params {
    slug: string
}

// Pre-render every published project at build time — SSG beats pure SSR
// for crawlability and TTFB. New projects still resolve on-demand via
// Next's fallback behavior; revalidation is handled by the underlying
// fetch's `next.revalidate` (see httpClient.ts) either way.
export async function generateStaticParams(): Promise<Params[]> {
    const projects = await loadProjects()
    return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(
    { params }: { params: Promise<Params> },
): Promise<Metadata> {
    const { slug } = await params
    const project = await loadProjectBySlug(slug)

    if (!project) return { title: 'Project not found' }

    const url         = `${SITE_URL}/projects/${project.slug}`
    const description = project.description.slice(0, 160)

    return {
        title:       project.name,
        description,
        alternates: { canonical: url },
        openGraph: {
            title:       project.name,
            description,
            url,
            type:        'website',
            images:      project.thumbnailUrl ? [{ url: project.thumbnailUrl }] : undefined,
        },
        twitter: {
            card:        project.thumbnailUrl ? 'summary_large_image' : 'summary',
            title:       project.name,
            description,
            images:      project.thumbnailUrl ? [project.thumbnailUrl] : undefined,
        },
    }
}

export default async function Page({ params }: { params: Promise<Params> }) {
    const { slug } = await params
    const project = await loadProjectBySlug(slug)

    if (!project) notFound()

    return <ProjectDetailPage project={project} />
}