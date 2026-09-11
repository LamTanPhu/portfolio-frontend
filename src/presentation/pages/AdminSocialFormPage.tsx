'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Share2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FormField } from '../atoms/FormField'
import { Checkbox } from '../atoms/Checkbox'
import { VisibilityWarning } from '../atoms/VisibilityWarning'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { AdminFormActions } from '../molecules/AdminFormActions'
import { CreateSocialAccountCommand } from '@/src/application/use-cases/commands/social/CreateSocialAccountCommand'
import { UpdateSocialAccountCommand } from '@/src/application/use-cases/commands/social/UpdateSocialAccountCommand'
import type { SocialAccountDTO } from '@/src/application/dtos/socialAccount/SocialAccountDTO'

type Props =
    | { mode: 'create' }
    | { mode: 'edit'; account: SocialAccountDTO }

export function AdminSocialFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()
    const toast = useToast()

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
            toast.show(`Saved "${name}".`, 'success')
            router.push('/admin/social')
        } catch {
            setError('Failed to save — check the backend is reachable.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <AdminPageHeader
                icon={<Share2 size={16} />}
                title={props.mode === 'create' ? 'new-social-account' : 'edit-social-account'}
            />

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="name" value={name} onChange={setName} placeholder="GitHub" />
                <FormField label="url" value={url} onChange={setUrl} placeholder="https://github.com/..." />
                <FormField label="imageUrl" value={imageUrl} onChange={setImageUrl} placeholder="https://... (optional icon URL)" />

                <Checkbox label="public" checked={isPublic} onChange={setIsPublic} />
                {!isPublic && <VisibilityWarning />}

                <AdminFormActions
                    submitting={submitting}
                    canSubmit={name.length > 0 && url.length > 0}
                    error={error}
                    onCancel={() => router.push('/admin/social')}
                />
            </form>
        </div>
    )
}
