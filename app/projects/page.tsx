// app/projects/page.tsx
import { ProjectsPage } from '@/src/presentation/pages/ProjectsPage'
import { loadProjects } from '@/src/application/use-cases/queries/project/loadProjects'

export default async function Page() {
    const projects = await loadProjects()
    return <ProjectsPage projects={projects} />
}