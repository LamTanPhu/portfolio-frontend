'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadCertifications } from '@/src/application/use-cases/queries/certification/loadCertification'
import type { CertificationDTO } from '@/src/application/dtos/certification/CertificationDTO'
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
        return <p className="font-mono text-sm text-(--text-muted) p-8">loading...</p>
    }

    if (cert === null) {
        return (
            <div className="max-w-2xl mx-auto p-8 flex flex-col gap-3">
                <p className="font-mono text-sm text-(--text-muted)">
                    No published certification with that id — it may not exist, or
                    it is currently unpublished.
                </p>
                <Link href="/admin/certifications" className="font-mono text-xs text-(--accent-teal) w-fit">
                    ← back to certifications
                </Link>
            </div>
        )
    }

    return <AdminCertificationFormPage mode="edit" certification={cert} />
}
