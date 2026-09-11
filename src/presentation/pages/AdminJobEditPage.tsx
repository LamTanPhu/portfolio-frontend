'use client'
import { useEffect, useState } from 'react'
import { loadJobs } from '@/src/application/use-cases/queries/job/loadJobs'
import type { JobDTO } from '@/src/application/dtos/job/JobDTO'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminNotFound } from '../atoms/AdminNotFound'
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
        return <LoadingLine />
    }

    if (job === null) {
        return (
            <AdminNotFound
                message="No public job with that id — it may not exist, or it is currently marked private."
                backHref="/admin/jobs"
                backLabel="back to jobs"
            />
        )
    }

    return <AdminJobFormPage mode="edit" job={job} />
}
