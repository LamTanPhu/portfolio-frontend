'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'
import { loadJobs } from '@/src/application/use-cases/queries/job/loadJobs'
import { DeleteJobCommand } from '@/src/application/use-cases/commands/job/DeleteJobCommand'
import type { JobDTO } from '@/src/application/dtos/job/JobDTO'

// =============================================================================
// AdminJobListPage — Page
// Same limitation as Skill/Education: GET /about/jobs is public-filtered
// only, so this list is limited to jobs currently public.
// =============================================================================
export function AdminJobListPage() {
    const { accessToken } = useAuth()

    const [jobs, setJobs]             = useState<JobDTO[] | null>(null)
    const [error, setError]           = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const refresh = useCallback(async () => {
        try {
            setJobs(await loadJobs())
        } catch {
            setError('Failed to load jobs.')
        }
    }, [])

    useEffect(() => {
        void refresh()
    }, [refresh])

    async function handleDelete(id: number, label: string) {
        if (!accessToken) return
        if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return

        setDeletingId(id)
        try {
            await DeleteJobCommand.create().execute(id, accessToken)
            setJobs((prev) => prev?.filter((j) => j.id !== id) ?? null)
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
                    <span className="text-(--text-muted)">_</span>jobs
                </h1>
                <Link href="/admin/jobs/new">
                    <Button size="sm">+ new job</Button>
                </Link>
            </div>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {jobs === null ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : jobs.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no public jobs yet.</p>
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {jobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex flex-col min-w-0">
                                <span className="font-mono text-sm text-(--text-primary) truncate">
                                    {job.role}
                                </span>
                                <span className="font-mono text-xs text-(--text-muted) truncate">
                                    {job.companyName}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/jobs/${job.id}/edit`}
                                    className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors"
                                >
                                    edit
                                </Link>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    disabled={deletingId === job.id}
                                    onClick={() => { void handleDelete(job.id, job.role) }}
                                >
                                    {deletingId === job.id ? '...' : 'delete'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
