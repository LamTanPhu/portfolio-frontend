'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadEducation } from '@/src/application/use-cases/queries/education/loadEducation'
import type { EducationDTO } from '@/src/application/dtos/education/EducationDTO'
import { AdminEducationFormPage } from './AdminEducationFormPage'

interface Props {
    id: number
}

export function AdminEducationEditPage({ id }: Props) {
    const [record, setRecord] = useState<EducationDTO | null | undefined>(undefined)
    const [error, setError]   = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        loadEducation()
            .then((records) => {
                if (cancelled) return
                setRecord(records.find((r) => r.id === id) ?? null)
            })
            .catch(() => {
                if (cancelled) return
                setError('Failed to load education record.')
            })
        return () => { cancelled = true }
    }, [id])

    if (error) {
        return <p className="font-mono text-xs text-red-500 p-8">{error}</p>
    }

    if (record === undefined) {
        return <p className="font-mono text-sm text-(--text-muted) p-8">loading...</p>
    }

    if (record === null) {
        return (
            <div className="max-w-2xl mx-auto p-8 flex flex-col gap-3">
                <p className="font-mono text-sm text-(--text-muted)">
                    No public education record with that id — it may not exist, or it is
                    currently marked private.
                </p>
                <Link href="/admin/education" className="font-mono text-xs text-(--accent-teal) w-fit">
                    ← back to education
                </Link>
            </div>
        )
    }

    return <AdminEducationFormPage mode="edit" education={record} />
}
