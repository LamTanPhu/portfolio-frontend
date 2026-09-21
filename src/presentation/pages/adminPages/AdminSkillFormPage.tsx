'use client'
import type { SkillDTO } from '@/src/application/dtos/skill/SkillDTO'
import { CreateSkillCommand } from '@/src/application/use-cases/commands/skill/CreateSkillCommand'
import { UpdateSkillCommand } from '@/src/application/use-cases/commands/skill/UpdateSkillCommand'
import { Tags } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Checkbox } from '../../atoms/Checkbox'
import { FormField } from '../../atoms/FormField'
import { Select } from '../../atoms/Select'
import { VisibilityWarning } from '../../atoms/VisibilityWarning'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AdminFormActions } from '../../molecules/AdminFormActions'
import { AdminPageHeader } from '../../molecules/AdminPageHeader'

const CATEGORY_OPTIONS = [
    { value: 'frontend', label: 'frontend' },
    { value: 'backend',  label: 'backend' },
    { value: 'devops',   label: 'devops' },
    { value: 'database', label: 'database' },
    { value: 'other',    label: 'other' },
]

// =============================================================================
// AdminSkillFormPage — Page
// Shared create/edit form. See VisibilityWarning for why the isPublic
// toggle carries a warning: no admin listing endpoint exists for skills, so
// unpublishing one here removes it from every admin view.
// =============================================================================
type Props =
    | { mode: 'create' }
    | { mode: 'edit'; skill: SkillDTO }

export function AdminSkillFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()
    const toast = useToast()

    const existing = props.mode === 'edit' ? props.skill : null

    const [name, setName]         = useState(existing?.name ?? '')
    const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? '')
    const [category, setCategory] = useState(existing?.category ?? 'other')
    const [isPublic, setIsPublic] = useState(true)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!accessToken) return

        setSubmitting(true)
        setError(null)

        try {
            if (props.mode === 'create') {
                await CreateSkillCommand.create().execute(
                    { name, imageUrl: imageUrl || null, category, isPublic },
                    accessToken,
                )
            } else {
                await UpdateSkillCommand.create().execute(
                    props.skill.id,
                    { name, imageUrl: imageUrl || null, category, isPublic },
                    accessToken,
                )
            }
            toast.show(`Saved "${name}".`, 'success')
            router.push('/admin/skills')
        } catch {
            setError('Failed to save — check the backend is reachable.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <AdminPageHeader
                icon={<Tags size={16} />}
                title={props.mode === 'create' ? 'new-skill' : 'edit-skill'}
            />

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="name" value={name} onChange={setName} placeholder="React" />
                <FormField label="imageUrl" value={imageUrl} onChange={setImageUrl} placeholder="https://... (optional icon URL)" />
                <Select label="category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />

                <Checkbox label="public" checked={isPublic} onChange={setIsPublic} />
                {!isPublic && <VisibilityWarning />}

                <AdminFormActions
                    submitting={submitting}
                    canSubmit={name.length > 0}
                    error={error}
                    onCancel={() => router.push('/admin/skills')}
                />
            </form>
        </div>
    )
}
