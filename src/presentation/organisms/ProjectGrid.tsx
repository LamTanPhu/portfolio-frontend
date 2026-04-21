import { ProjectDTO } from '@/application/dtos/ProjectDTO'
import { ProjectCard } from '../molecules/ProjectCard'

interface Props { projects: ProjectDTO[] }

export function ProjectGrid({ projects }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
    </div>
  )
}
