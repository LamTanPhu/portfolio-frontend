'use client'
import { useEffect, useState } from 'react'
import { loadCertifications } from '@/src/application/use-cases/queries/certification/loadCertification'
import type { CertificationDTO } from '@/src/application/dtos/certification/CertificationDTO'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminNotFound } from '../atoms/AdminNotFound'
import { AdminCertificationFormPage } from './AdminCertificationFormPage'

interface Props {
    id: number
}

export function AdminCertificationEditPage({ id }: Props) {
    const [cert, setCert]   = useState<CertificationDTO | null | undefined>(undefined)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        loadCertifications()
            .then((certs) => {
                if (cancelled) return
                setCert(certs.find((c) => c.id === id) ?? null)
            })
            .catch(() => {
                if (cancelled) return
                setError('Failed to load certification.')
            })
        return () => { cancelled = true }
    }, [id])

    if (error) {
        return <p className="font-mono text-xs text-red-500 p-8">{error}</p>
    }

    if (cert === undefined) {
        return <LoadingLine />
    }

    if (cert === null) {
        return (
            <AdminNotFound
                message="No published certification with that id — it may not exist, or it is currently unpublished."
                backHref="/admin/certifications"
                backLabel="back to certifications"
            />
        )
    }

    return <AdminCertificationFormPage mode="edit" certification={cert} />
}
