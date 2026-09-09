'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'
import { loadCertifications } from '@/src/application/use-cases/queries/certification/loadCertification'
import { DeleteCertificationCommand } from '@/src/application/use-cases/commands/certification/DeleteCertificationCommand'
import type { CertificationDTO } from '@/src/application/dtos/certification/CertificationDTO'

// =============================================================================
// AdminCertificationListPage — Page
// Same limitation as Skill/Education/Job: GET /about/certifications is
// published-filtered only, so this list is limited to certifications
// currently published.
// =============================================================================
export function AdminCertificationListPage() {
    const { accessToken } = useAuth()

    const [certs, setCerts]           = useState<CertificationDTO[] | null>(null)
    const [error, setError]           = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const refresh = useCallback(async () => {
        try {
            setCerts(await loadCertifications())
        } catch {
            setError('Failed to load certifications.')
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
            await DeleteCertificationCommand.create().execute(id, accessToken)
            setCerts((prev) => prev?.filter((c) => c.id !== id) ?? null)
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
                    <span className="text-(--text-muted)">_</span>certifications
                </h1>
                <Link href="/admin/certifications/new">
                    <Button size="sm">+ new certification</Button>
                </Link>
            </div>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {certs === null ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : certs.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no published certifications yet.</p>
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {certs.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between px-4 py-3">
                            <span className="font-mono text-sm text-(--text-primary) truncate">
                                {cert.name}
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/certifications/${cert.id}/edit`}
                                    className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors"
                                >
                                    edit
                                </Link>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    disabled={deletingId === cert.id}
                                    onClick={() => { void handleDelete(cert.id, cert.name) }}
                                >
                                    {deletingId === cert.id ? '...' : 'delete'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
