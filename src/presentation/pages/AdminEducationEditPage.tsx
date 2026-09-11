'use client'
import { useEffect, useState } from 'react'
import { loadEducation } from '@/src/application/use-cases/queries/education/loadEducation'
import type { EducationDTO } from '@/src/application/dtos/education/EducationDTO'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminNotFound } from '../atoms/AdminNotFound'
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
        return <LoadingLine />
    }

    if (record === null) {
        return (
            <AdminNotFound
                message="No public education record with that id — it may not exist, or it is currently marked private."
                backHref="/admin/education"
                backLabel="back to education"
            />
        )
    }

    return <AdminEducationFormPage mode="edit" education={record} />
}
