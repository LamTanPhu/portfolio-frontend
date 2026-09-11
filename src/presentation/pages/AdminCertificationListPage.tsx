'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Award, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../atoms/Button'
import { EmptyState } from '../atoms/EmptyState'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { AdminListRow } from '../molecules/AdminListRow'
import { AdminRowActions } from '../molecules/AdminRowActions'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
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
    const toast = useToast()

    const [certs, setCerts]           = useState<CertificationDTO[] | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [pendingDelete, setPendingDelete] = useState<CertificationDTO | null>(null)

    const refresh = useCallback(async () => {
        try {
            setCerts(await loadCertifications())
        } catch {
            toast.show('Failed to load certifications.', 'error')
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
            await DeleteCertificationCommand.create().execute(target.id, accessToken)
            setCerts((prev) => prev?.filter((c) => c.id !== target.id) ?? null)
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
                icon={<Award size={16} />}
                title="certifications"
                count={certs?.length ?? null}
                action={
                    <Link href="/admin/certifications/new">
                        <Button size="sm" className="flex items-center gap-1.5"><Plus size={13} /> new certification</Button>
                    </Link>
                }
            />

            {certs === null ? (
                <LoadingLine />
            ) : certs.length === 0 ? (
                <EmptyState icon={<Award size={28} />} message="no published certifications yet." />
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {certs.map((cert) => (
                        <AdminListRow
                            key={cert.id}
                            title={cert.name}
                            actions={
                                <AdminRowActions
                                    editHref={`/admin/certifications/${cert.id}/edit`}
                                    onDelete={() => setPendingDelete(cert)}
                                    deleting={deletingId === cert.id}
                                />
                            }
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Delete certification?"
                message={pendingDelete ? `"${pendingDelete.name}" will be permanently removed. This can't be undone.` : ''}
                onConfirm={() => { void confirmDelete() }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    )
}
