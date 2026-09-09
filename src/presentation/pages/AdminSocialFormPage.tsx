'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../atoms/FormField'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { VisibilityWarning } from '../atoms/VisibilityWarning'
import { CreateSocialAccountCommand } from '@/src/application/use-cases/commands/social/CreateSocialAccountCommand'
import { UpdateSocialAccountCommand } from '@/src/application/use-cases/commands/social/UpdateSocialAccountCommand'
import type { SocialAccountDTO } from '@/src/application/dtos/socialAccount/SocialAccountDTO'

type Props =
    | { mode: 'create' }
    | { mode: 'edit'; account: SocialAccountDTO }

export function AdminSocialFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()

    const existing = props.mode === 'edit' ? props.account : null

    const [name, setName]         = useState(existing?.name ?? '')
    const [url, setUrl]           = useState(existing?.url ?? '')
    const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? '')
    const [isPublic, setIsPublic] = useState(true)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!accessToken) return

        setSubmitting(true)
        setError(null)

        const payload = { name, url, imageUrl: imageUrl || null, isPublic }

        try {
            if (props.mode === 'create') {
                await CreateSocialAccountCommand.create().execute(payload, accessToken)
            } else {
                await UpdateSocialAccountCommand.create().execute(props.account.id, payload, accessToken)
            }
            router.push('/admin/social')
        } catch {
            setError('Failed to save — check the backend is reachable and try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-6">
                <span className="text-(--text-muted)">_</span>
                {props.mode === 'create' ? 'new-social-account' : 'edit-social-account'}
            </h1>

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="name" value={name} onChange={setName} placeholder="GitHub" />
                <FormField label="url" value={url} onChange={setUrl} placeholder="https://github.com/..." />
                <FormField label="imageUrl" value={imageUrl} onChange={setImageUrl} placeholder="https://... (optional icon URL)" />

                <Checkbox label="public" checked={isPublic} onChange={setIsPublic} />
                {!isPublic && <VisibilityWarning />}

                {error && <p className="font-mono text-xs text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <Button type="submit" disabled={submitting || name.length === 0 || url.length === 0}>
                        {submitting ? 'saving...' : 'save'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/social')}>
                        cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
