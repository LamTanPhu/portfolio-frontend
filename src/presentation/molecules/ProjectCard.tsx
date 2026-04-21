import { ProjectDTO } from '@/application/dtos/ProjectDTO'
import { Badge } from '../atoms/Badge'

interface Props { project: ProjectDTO }

export function ProjectCard({ project }: Props) {
  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3">
      <h3 className="font-medium text-sm">{project.name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-1">
        {project.techStack.map((t) => <Badge key={t} label={t} />)}
      </div>
    </div>
  )
}
