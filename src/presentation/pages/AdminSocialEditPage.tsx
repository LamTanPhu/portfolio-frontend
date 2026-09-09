'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadSocialAccounts } from '@/src/application/use-cases/queries/social/loadSocialAccounts'
import type { SocialAccountDTO } from '@/src/application/dtos/socialAccount/SocialAccountDTO'
import { AdminSocialFormPage } from './AdminSocialFormPage'

interface Props {
    id: number
}

export function AdminSocialEditPage({ id }: Props) {
    const [account, setAccount] = useState<SocialAccountDTO | null | undefined>(undefined)
    const [error, setError]     = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        loadSocialAccounts()
            .then((accounts) => {
                if (cancelled) return
                setAccount(accounts.find((a) => a.id === id) ?? null)
            })
            .catch(() => {
                if (cancelled) return
                setError('Failed to load social account.')
            })
        return () => { cancelled = true }
    }, [id])

    if (error) {
        return <p className="font-mono text-xs text-red-500 p-8">{error}</p>
    }

    if (account === undefined) {
        return <p className="font-mono text-sm text-(--text-muted) p-8">loading...</p>
    }

    if (account === null) {
        return (
            <div className="max-w-2xl mx-auto p-8 flex flex-col gap-3">
                <p className="font-mono text-sm text-(--text-muted)">
                    No public social account with that id — it may not exist, or
                    it is currently marked private.
                </p>
                <Link href="/admin/social" className="font-mono text-xs text-(--accent-teal) w-fit">
                    ← back to social accounts
                </Link>
            </div>
        )
    }

    return <AdminSocialFormPage mode="edit" account={account} />
}
