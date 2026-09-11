'use client'
import { useEffect, useState } from 'react'
import { loadSocialAccounts } from '@/src/application/use-cases/queries/social/loadSocialAccounts'
import type { SocialAccountDTO } from '@/src/application/dtos/socialAccount/SocialAccountDTO'
import { LoadingLine } from '../atoms/LoadingLine'
import { AdminNotFound } from '../atoms/AdminNotFound'
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
        return <LoadingLine />
    }

    if (account === null) {
        return (
            <AdminNotFound
                message="No public social account with that id — it may not exist, or it is currently marked private."
                backHref="/admin/social"
                backLabel="back to social accounts"
            />
        )
    }

    return <AdminSocialFormPage mode="edit" account={account} />
}
