// app/projects/page.tsx
import type { Metadata } from 'next'
import { ProjectsPage } from '@/src/presentation/pages/ProjectsPage'
import { loadProjects } from '@/src/application/use-cases/queries/project/loadProjects'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
    title:       'Projects',
    description: 'Selected software projects by Lam Tan Phu, spanning full-stack web development, backend systems, and game development.',
    alternates:  { canonical: `${SITE_URL}/projects` },
    openGraph: {
        title:       'Projects — Lam Tan Phu',
        description: 'Selected software projects by Lam Tan Phu, spanning full-stack web development, backend systems, and game development.',
        url:         `${SITE_URL}/projects`,
        type:        'website',
    },
    twitter: {
        card:        'summary',
        title:       'Projects — Lam Tan Phu',
        description: 'Selected software projects by Lam Tan Phu, spanning full-stack web development, backend systems, and game development.',
    },
}

export default async function Page() {
    const projects = await loadProjects()
    return <ProjectsPage projects={projects} />
}