'use client'
import type { JobDTO } from '@/src/application/dtos/job/JobDTO'
import { DeleteJobCommand } from '@/src/application/use-cases/commands/job/DeleteJobCommand'
import { loadJobs } from '@/src/application/use-cases/queries/job/loadJobs'
import { Briefcase, Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '../../atoms/Button'
import { EmptyState } from '../../atoms/EmptyState'
import { LoadingLine } from '../../atoms/LoadingLine'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AdminListRow } from '../../molecules/AdminListRow'
import { AdminPageHeader } from '../../molecules/AdminPageHeader'
import { AdminRowActions } from '../../molecules/AdminRowActions'
import { ConfirmDialog } from '../../molecules/ConfirmDialog'

// =============================================================================
// AdminJobListPage — Page
// Same limitation as Skill/Education: GET /about/jobs is public-filtered
// only, so this list is limited to jobs currently public.
// =============================================================================
export function AdminJobListPage() {
    const { accessToken } = useAuth()
    const toast = useToast()

    const [jobs, setJobs]             = useState<JobDTO[] | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [pendingDelete, setPendingDelete] = useState<JobDTO | null>(null)

    useEffect(() => {
        let ignore = false
        void (async () => {
            try {
                const result = await loadJobs()
                if (!ignore) setJobs(result)
            } catch {
                if (!ignore) toast.show('Failed to load jobs.', 'error')
            }
        })()
        return () => { ignore = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function confirmDelete() {
        if (!accessToken || !pendingDelete) return
        const target = pendingDelete
        setPendingDelete(null)
        setDeletingId(target.id)
        try {
            await DeleteJobCommand.create().execute(target.id, accessToken)
            setJobs((prev) => prev?.filter((j) => j.id !== target.id) ?? null)
            toast.show(`Deleted "${target.role}".`, 'success')
        } catch {
            toast.show('Failed to delete — try again.', 'error')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <AdminPageHeader
                icon={<Briefcase size={16} />}
                title="jobs"
                count={jobs?.length ?? null}
                action={
                    <Link href="/admin/jobs/new">
                        <Button size="sm" className="flex items-center gap-1.5"><Plus size={13} /> new job</Button>
                    </Link>
                }
            />

            {jobs === null ? (
                <LoadingLine />
            ) : jobs.length === 0 ? (
                <EmptyState icon={<Briefcase size={28} />} message="no public jobs yet." />
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {jobs.map((job) => (
                        <AdminListRow
                            key={job.id}
                            title={job.role}
                            subtitle={job.companyName}
                            actions={
                                <AdminRowActions
                                    editHref={`/admin/jobs/${job.id}/edit`}
                                    onDelete={() => setPendingDelete(job)}
                                    deleting={deletingId === job.id}
                                />
                            }
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Delete job?"
                message={pendingDelete ? `"${pendingDelete.role}" will be permanently removed. This can't be undone.` : ''}
                onConfirm={() => { void confirmDelete() }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    )
}
