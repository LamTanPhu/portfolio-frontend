'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Share2, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../atoms/Button'
import { EmptyState } from '../atoms/EmptyState'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { AdminListRow } from '../molecules/AdminListRow'
import { AdminRowActions } from '../molecules/AdminRowActions'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
import { loadSocialAccounts } from '@/src/application/use-cases/queries/social/loadSocialAccounts'
import { DeleteSocialAccountCommand } from '@/src/application/use-cases/commands/social/DeleteSocialAccountCommand'
import type { SocialAccountDTO } from '@/src/application/dtos/socialAccount/SocialAccountDTO'

// =============================================================================
// AdminSocialListPage — Page
// Same limitation as the other about-page resources: GET /social is
// public-filtered only, so this list is limited to accounts currently public.
// =============================================================================
export function AdminSocialListPage() {
    const { accessToken } = useAuth()
    const toast = useToast()

    const [accounts, setAccounts]     = useState<SocialAccountDTO[] | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [pendingDelete, setPendingDelete] = useState<SocialAccountDTO | null>(null)

    const refresh = useCallback(async () => {
        try {
            setAccounts(await loadSocialAccounts())
        } catch {
            toast.show('Failed to load social accounts.', 'error')
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
            await DeleteSocialAccountCommand.create().execute(target.id, accessToken)
            setAccounts((prev) => prev?.filter((a) => a.id !== target.id) ?? null)
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
                icon={<Share2 size={16} />}
                title="social-accounts"
                count={accounts?.length ?? null}
                action={
                    <Link href="/admin/social/new">
                        <Button size="sm" className="flex items-center gap-1.5"><Plus size={13} /> new account</Button>
                    </Link>
                }
            />

            {accounts === null ? (
                <LoadingLine />
            ) : accounts.length === 0 ? (
                <EmptyState icon={<Share2 size={28} />} message="no public social accounts yet." />
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {accounts.map((acc) => (
                        <AdminListRow
                            key={acc.id}
                            title={acc.name}
                            subtitle={acc.url}
                            actions={
                                <AdminRowActions
                                    editHref={`/admin/social/${acc.id}/edit`}
                                    onDelete={() => setPendingDelete(acc)}
                                    deleting={deletingId === acc.id}
                                />
                            }
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                title="Delete social account?"
                message={pendingDelete ? `"${pendingDelete.name}" will be permanently removed. This can't be undone.` : ''}
                onConfirm={() => { void confirmDelete() }}
                onCancel={() => setPendingDelete(null)}
            />
        </div>
    )
}
