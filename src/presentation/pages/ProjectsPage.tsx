'use client'
import { useState } from 'react'
import { ActiveFilterTab } from '../molecules/ActiveFilterTab'
import { ProjectCard } from '../molecules/ProjectCard'
import { ProjectsSidebar } from '../organisms/ProjectsSidebar'
import { VSCodeLayout } from '../templates/VSCodeLayout'
import type { ProjectDTO } from '@/src/application/dtos/ProjectDTO'

// =============================================================================
// ProjectsPage — Page
// Filter state lives here — coordinates sidebar checkboxes, active filter tab,
// and project grid. Union filter: show projects matching ANY selected tech.
//
// `projects` is fetched server-side in app/projects/page.tsx (via loadProjects())
// and passed in as a prop. This component only owns filter/UI state — it never
// fetches data itself.
// =============================================================================

interface Props {
    projects: ProjectDTO[]
}

export function ProjectsPage({ projects }: Props) {
    const [selected, setSelected] = useState<string[]>([])

    function handleToggle(label: string) {
        setSelected((prev) =>
        prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
        )
    }

    function handleClear() {
        setSelected([])
    }

    // Union filter — show projects that include ANY selected tech
    const filtered = selected.length === 0
        ? projects
        : projects.filter((p) =>
            p.techStack.some((t) => selected.includes(t))
        )

    return (
        <VSCodeLayout activeTab="projects" showSidebar={false}>
            <div className="flex h-full overflow-hidden">

                {/* Sidebar */}
                <ProjectsSidebar selected={selected} onChange={handleToggle} />

                {/* Main content */}
                <div className="flex flex-col flex-1 overflow-hidden">

                {/* Active filter tab */}
                <ActiveFilterTab selected={selected} onClear={handleClear} />

                {/* Project grid */}
                <div className="flex-1 overflow-y-auto p-6 glow-bg">
                    {filtered.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="font-mono text-sm text-(--text-muted)">
                        {projects.length === 0
                            ? '// no projects published yet'
                            : '// no projects match the selected filters'}
                        </p>
                    </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-6xl">
                        {filtered.map((project, i) => (
                        <ProjectCard
                            key={project.id}
                            index={i + 1}
                            name={project.name}
                            slug={project.slug}
                            description={project.description}
                            techStack={project.techStack}
                            thumbnailUrl={project.thumbnailUrl}
                            liveUrl={project.liveUrl}
                            repoUrl={project.repoUrl}
                        />
                        ))}
                    </div>
                    )}
                </div>

                </div>
            </div>
        </VSCodeLayout>
    )
}