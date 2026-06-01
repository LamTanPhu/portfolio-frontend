'use client'
import { useState } from 'react'
import { ActiveFilterTab } from '../molecules/ActiveFilterTab'
import { ProjectCard } from '../molecules/ProjectCard'
import { ProjectsSidebar } from '../organisms/ProjectsSidebar'
import { VSCodeLayout } from '../templates/VSCodeLayout'

// =============================================================================
// ProjectsPage — Page
// Filter state lives here — coordinates sidebar checkboxes, active filter tab,
// and project grid. Union filter: show projects matching ANY selected tech.
// =============================================================================

interface Project {
    id:           number
    name:         string
    slug:         string
    description:  string
    techStack:    string[]
    thumbnailUrl: string | null
    liveUrl:      string | null
    repoUrl:      string | null
}

const MOCK_PROJECTS: Project[] = [
    {
        id: 1, name: 'ui-animations', slug: 'ui-animations',
        description: 'A collection of smooth UI animations and micro-interactions built with React and Tailwind.',
        techStack: ['React', 'TypeScript', 'Tailwind'],
        thumbnailUrl: null, liveUrl: null, repoUrl: 'https://github.com',
    },
    {
        id: 2, name: 'tetris-game', slug: 'tetris-game',
        description: 'Classic Tetris implemented in Vue with a modern dark UI and local high score tracking.',
        techStack: ['Vue', 'TypeScript', 'CSS'],
        thumbnailUrl: null, liveUrl: null, repoUrl: 'https://github.com',
    },
    {
        id: 3, name: 'nimbus', slug: 'nimbus',
        description: 'A minimal weather dashboard built with Next.js and the OpenWeather API.',
        techStack: ['Next.js', 'TypeScript', 'Tailwind'],
        thumbnailUrl: null, liveUrl: 'https://example.com', repoUrl: 'https://github.com',
    },
    {
        id: 4, name: 'portfolio', slug: 'portfolio',
        description: 'This very portfolio — VS Code themed, built with Next.js and clean architecture.',
        techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'PostgreSQL'],
        thumbnailUrl: null, liveUrl: null, repoUrl: 'https://github.com',
    },
]

export function ProjectsPage() {
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
        ? MOCK_PROJECTS
        : MOCK_PROJECTS.filter((p) =>
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
                        // no projects match the selected filters
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