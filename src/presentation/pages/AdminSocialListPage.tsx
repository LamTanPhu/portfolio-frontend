'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { Button } from '../atoms/Button'
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

    const [accounts, setAccounts]     = useState<SocialAccountDTO[] | null>(null)
    const [error, setError]           = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const refresh = useCallback(async () => {
        try {
            setAccounts(await loadSocialAccounts())
        } catch {
            setError('Failed to load social accounts.')
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
            await DeleteSocialAccountCommand.create().execute(id, accessToken)
            setAccounts((prev) => prev?.filter((a) => a.id !== id) ?? null)
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
                    <span className="text-(--text-muted)">_</span>social-accounts
                </h1>
                <Link href="/admin/social/new">
                    <Button size="sm">+ new account</Button>
                </Link>
            </div>

            {error && <p className="font-mono text-xs text-red-500 mb-4">{error}</p>}

            {accounts === null ? (
                <p className="font-mono text-sm text-(--text-muted)">loading...</p>
            ) : accounts.length === 0 ? (
                <p className="font-mono text-sm text-(--text-muted)">no public social accounts yet.</p>
            ) : (
                <div className="flex flex-col divide-y divide-(--border-muted) border border-(--border-muted)">
                    {accounts.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex flex-col min-w-0">
                                <span className="font-mono text-sm text-(--text-primary) truncate">
                                    {acc.name}
                                </span>
                                <span className="font-mono text-xs text-(--text-muted) truncate">
                                    {acc.url}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={`/admin/social/${acc.id}/edit`}
                                    className="font-mono text-xs text-(--text-muted) hover:text-(--text-primary) transition-colors"
                                >
                                    edit
                                </Link>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    disabled={deletingId === acc.id}
                                    onClick={() => { void handleDelete(acc.id, acc.name) }}
                                >
                                    {deletingId === acc.id ? '...' : 'delete'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
