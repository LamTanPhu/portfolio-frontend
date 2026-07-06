import Link from 'next/link'
import { VSCodeLayout } from '../templates/VSCodeLayout'
import { Badge }        from '../atoms/Badge'
import { ProjectViewTracker } from '../organisms/ProjectViewTracker'
import { SITE_URL }     from '@/lib/constants'
import type { ProjectDTO } from '@/src/application/dtos/ProjectDTO'

// =============================================================================
// ProjectDetailPage — Page
// Full project view at /projects/[slug]. Server Component — `project` is
// fetched in app/projects/[slug]/page.tsx via loadProjectBySlug() and
// passed in as a prop.
// =============================================================================

// schema.org/SoftwareSourceCode — more specific than generic CreativeWork
// given every project here is a software project. codeRepository is only
// set when repoUrl exists (private/closed-source projects still get a
// valid schema, just without that field).
function buildJsonLd(project: ProjectDTO) {
    return {
        '@context':       'https://schema.org',
        '@type':          'SoftwareSourceCode',
        name:             project.name,
        description:      project.description,
        url:              `${SITE_URL}/projects/${project.slug}`,
        codeRepository:   project.repoUrl ?? undefined,
        programmingLanguage: project.techStack,
        dateCreated:      project.createdAt,
        dateModified:     project.updatedAt,
        author: {
            '@type': 'Person',
            name:    'Lam Tan Phu',
        },
    }
}

interface Props {
    project: ProjectDTO
}

export function ProjectDetailPage({ project }: Props) {
    return (
        <VSCodeLayout activeTab="projects" showSidebar={false}>
            <ProjectViewTracker projectId={project.id} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(project)) }}
            />
            <div className="flex flex-col h-full overflow-y-auto glow-bg">
                <article className="flex flex-col w-full max-w-3xl mx-auto p-8">

                    <Link
                        href="/projects"
                        className="font-mono text-sm text-(--accent-teal) hover:opacity-80 transition-opacity mb-6 w-fit"
                    >
                        ← back to projects
                    </Link>

                    {project.thumbnailUrl && (
                        <div className="w-full h-64 rounded-lg overflow-hidden border border-(--border-muted) mb-6">
                            <img
                                src={project.thumbnailUrl}
                                alt={project.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <header className="flex flex-col gap-3 pb-6 border-b border-(--border-muted) mb-6">
                        <h1 className="font-mono text-2xl text-(--text-primary) leading-snug">
                            <span className="text-(--text-muted)">_</span>{project.name}
                        </h1>
                        <div className="flex flex-wrap gap-1.5">
                            {project.techStack.map((tech) => (
                                <Badge key={tech} label={tech} />
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1">
                            {project.liveUrl && (
                                <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs px-4 py-2 border border-(--border-muted) text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent-teal) transition-colors duration-150"
                                >
                                    live-demo ↗
                                </a>
                            )}
                            {project.repoUrl && (
                                <a
                                    href={project.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs px-4 py-2 border border-(--border-muted) text-(--text-muted) hover:text-(--text-primary) hover:border-(--accent-teal) transition-colors duration-150"
                                >
                                    source-code ↗
                                </a>
                            )}
                        </div>
                    </header>

                    <div className="font-mono text-sm text-(--text-primary) leading-7 whitespace-pre-wrap">
                        {project.description}
                    </div>

                </article>
            </div>
        </VSCodeLayout>
    )
}