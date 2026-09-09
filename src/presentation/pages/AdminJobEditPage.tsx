'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadJobs } from '@/src/application/use-cases/queries/job/loadJobs'
import type { JobDTO } from '@/src/application/dtos/job/JobDTO'
import { AdminJobFormPage } from './AdminJobFormPage'

interface Props {
    id: number
}

export function AdminJobEditPage({ id }: Props) {
    const [job, setJob]     = useState<JobDTO | null | undefined>(undefined)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        loadJobs()
            .then((jobs) => {
                if (cancelled) return
                setJob(jobs.find((j) => j.id === id) ?? null)
            })
            .catch(() => {
                if (cancelled) return
                setError('Failed to load job.')
            })
        return () => { cancelled = true }
    }, [id])

    if (error) {
        return <p className="font-mono text-xs text-red-500 p-8">{error}</p>
    }

    if (job === undefined) {
        return <p className="font-mono text-sm text-(--text-muted) p-8">loading...</p>
    }

    if (job === null) {
        return (
            <div className="max-w-2xl mx-auto p-8 flex flex-col gap-3">
                <p className="font-mono text-sm text-(--text-muted)">
                    No public job with that id — it may not exist, or it is currently
                    marked private.
                </p>
                <Link href="/admin/jobs" className="font-mono text-xs text-(--accent-teal) w-fit">
                    ← back to jobs
                </Link>
            </div>
        )
    }

    return <AdminJobFormPage mode="edit" job={job} />
}
