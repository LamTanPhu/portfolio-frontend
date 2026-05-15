import type { ProjectDTO } from '../../application/dtos/ProjectDTO'
import { Badge } from '../atoms/Badge'

interface Props { project: ProjectDTO }

export function ProjectCard({ project }: Props) {
  return (
    <div className="border border-[#3c3c3c] bg-[#1e1e1e] p-4 hover:border-[#007acc] transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-mono text-sm text-[#cccccc]">{project.name}</h3>
        {project.isOpenSource && <span className="font-mono text-[10px] text-[#608b4e]">open-source</span>}
      </div>
      {project.description && <p className="font-mono text-[11px] text-[#858585] mb-3 line-clamp-2">{project.description}</p>}
      <div className="flex flex-wrap gap-1 mb-3">
        {project.techStack.map(tech => <Badge key={tech} label={tech} />)}
      </div>
      <div className="flex gap-3">
        {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-[#569cd6] hover:underline">repo</a>}
        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-[#569cd6] hover:underline">live</a>}
      </div>
    </div>
  )
}
