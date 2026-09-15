'use client'
import type { EducationDTO } from '@/src/application/dtos/education/EducationDTO'
import { DeleteEducationCommand } from '@/src/application/use-cases/commands/education/DeleteEducationCommand'
import { GetEducationQuery } from '@/src/application/use-cases/queries/education/GetEducationQuery'
import { GraduationCap, Plus } from 'lucide-react'
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
// AdminEducationListPage — Page
// Same limitation as Skill: GET /about/education is public-filtered only,
// so this list (and what's editable/deletable here) is limited to records
// currently public.
// =============================================================================
export function AdminEducationListPage() {
    const { accessToken } = useAuth()
    const toast = useToast()

    const [records, setRecords]       = useState<EducationDTO[] | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [pendingDelete, setPendingDelete] = useState<EducationDTO | null>(null)

    useEffect(() => {
        let ignore = false
        void (async () => {
            try {
                const result = await GetEducationQuery.createForAdmin().execute()
                if (!ignore) setRecords(result)
            } catch {
                if (!ignore) toast.show('Failed to load education records.', 'error')
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
            await DeleteEducationCommand.create().execute(target.id, accessToken)
            setRecords((prev) => prev?.filter((r) => r.id !== target.id) ?? null)
            toast.show(`Deleted "${target.degreeName}".`, 'success')
        } catch {
            toast.show('Failed to delete — try again.', 'error')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            <AdminPageHeader
                icon={<GraduationCap size={16} />}
                title="education"
                count={records?.length ?? null}
                action={
                    <Link href="/admin/education/new">
                        <Button size="sm" className="flex items-center gap-1.5"><Plus size={13} /> new record</Button>
                    </Link>
                }
            />

            {records === null ? (
                <LoadingLine />
            ) : records.length === 0 ? (
                <EmptyState icon={<GraduationCap size={28} />} message="no public education records yet." />
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {records.map((rec) => (
                        <AdminListRow
                            key={rec.id}
                            title={rec.degreeName}
                            subtitle={rec.instituteName}
                            actions={
                                <AdminRowActions
                                    editHref={`/admin/education/${rec.id}/edit`}
                                    onDelete={() => setPendingDelete(rec)}
                                    deleting={deletingId === rec.id}
                                />
                            }
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Delete education record?"
                message={pendingDelete ? `"${pendingDelete.degreeName}" will be permanently removed. This can't be undone.` : ''}
                onConfirm={() => { void confirmDelete() }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    )
}
