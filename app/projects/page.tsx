// app/projects/page.tsx
import type { Metadata } from 'next'
import { ProjectsPage } from '@/src/presentation/pages/ProjectsPage'
import { loadProjects } from '@/src/application/use-cases/queries/project/loadProjects'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
    title:       'Projects',
    description: 'Selected software projects by Lam Tan Phu, spanning full-stack web development, backend systems, and game development.',
    alternates:  { canonical: `${SITE_URL}/projects` },
}

export default async function Page() {
    const projects = await loadProjects()
    return <ProjectsPage projects={projects} />
}