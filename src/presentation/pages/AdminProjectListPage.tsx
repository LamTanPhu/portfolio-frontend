'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { FolderCode, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../atoms/Button'
import { StatusBadge } from '../atoms/StatusBadge'
import { EmptyState } from '../atoms/EmptyState'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { AdminListRow } from '../molecules/AdminListRow'
import { AdminRowActions } from '../molecules/AdminRowActions'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
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
    const toast = useToast()

    const [projects, setProjects]     = useState<ProjectSummaryDTO[] | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [pendingDelete, setPendingDelete] = useState<ProjectSummaryDTO | null>(null)

    const refresh = useCallback(async () => {
        try {
            setProjects(await loadProjects())
        } catch {
            toast.show('Failed to load projects.', 'error')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        void refresh()
    }, [refresh])

    async function confirmDelete() {
        if (!accessToken || !pendingDelete) return
        const target = pendingDelete
        setPendingDelete(null)
        setDeletingId(target.id)
        try {
            await DeleteProjectCommand.create().execute(target.id, accessToken)
            setProjects((prev) => prev?.filter((p) => p.id !== target.id) ?? null)
            toast.show(`Deleted "${target.name}".`, 'success')
        } catch {
            toast.show('Failed to delete — try again.', 'error')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <AdminPageHeader
                icon={<FolderCode size={16} />}
                title="projects"
                count={projects?.length ?? null}
                action={
                    <Link href="/admin/projects/new">
                        <Button size="sm" className="flex items-center gap-1.5"><Plus size={13} /> new project</Button>
                    </Link>
                }
            />

            {projects === null ? (
                <LoadingLine />
            ) : projects.length === 0 ? (
                <EmptyState icon={<FolderCode size={28} />} message="no published projects yet." />
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {projects.map((project) => (
                        <AdminListRow
                            key={project.id}
                            leading={<StatusBadge published={project.isPublished} />}
                            title={project.name}
                            actions={
                                <AdminRowActions
                                    editHref={`/admin/projects/${project.slug}/edit`}
                                    onDelete={() => setPendingDelete(project)}
                                    deleting={deletingId === project.id}
                                />
                            }
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Delete project?"
                message={pendingDelete ? `"${pendingDelete.name}" will be permanently removed. This can't be undone.` : ''}
                onConfirm={() => { void confirmDelete() }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    )
}
