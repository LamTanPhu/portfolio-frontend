'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'
import { StatusBadge } from '../atoms/StatusBadge'
import { loadProjects } from '@/src/application/use-cases/queries/project/loadProjects'
import { DeleteProjectCommand } from '@/src/application/use-cases/commands/project/DeleteProjectCommand'
import type { ProjectSummaryDTO } from '@/src/application/dtos/project/ProjectSummaryDTO'

// =============================================================================
// AdminProjectListPage — Page
// Same limitation as the about-page resources: GET /projects only returns
// published projects (no admin "everything" route like blogs/admin), so
// this list is limited to projects currently published.
// =============================================================================
export function AdminProjectListPage() {
    const { accessToken } = useAuth()

    const [projects, setProjects]     = useState<ProjectSummaryDTO[] | null>(null)
    const [error, setError]           = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const refresh = useCallback(async () => {
        try {
            setProjects(await loadProjects())
        } catch {
            setError('Failed to load projects.')
        }
    }, [])

    useEffect(() => {
        void refresh()
    }, [refresh])

    async function handleDelete(id: number, name: string) {
        if (!accessToken) return
        if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return

        setDeletingId(id)
        try {
            await DeleteProjectCommand.create().execute(id, accessToken)
            setProjects((prev) => prev?.filter((p) => p.id !== id) ?? null)
        } catch {
            setError('Failed to delete — try again.')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-mono text-lg text-(--text-primary)">
                    <span className="text-(--text-muted)">_</span>projects
                </h1>
                <Link href="/admin/projects/new">
                    <Button size="sm">+ new project</Button>
                </Link>
            </div>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {projects === null ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : projects.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no published projects yet.</p>
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <StatusBadge published={project.isPublished} />
                                <span className="font-mono text-sm text-(--text-primary) truncate">
                                    {project.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/projects/${project.slug}/edit`}
                                    className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors"
                                >
                                    edit
                                </Link>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    disabled={deletingId === project.id}
                                    onClick={() => { void handleDelete(project.id, project.name) }}
                                >
                                    {deletingId === project.id ? '...' : 'delete'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
