'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../atoms/FormField'
import { Select } from '../atoms/Select'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { VisibilityWarning } from '../atoms/VisibilityWarning'
import { CreateSkillCommand } from '@/src/application/use-cases/commands/skill/CreateSkillCommand'
import { UpdateSkillCommand } from '@/src/application/use-cases/commands/skill/UpdateSkillCommand'
import type { SkillDTO } from '@/src/application/dtos/skill/SkillDTO'

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
            router.push('/admin/skills')
        } catch {
            setError('Failed to save — check the backend is reachable and try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-6">
                <span className="text-(--text-muted)">_</span>
                {props.mode === 'create' ? 'new-skill' : 'edit-skill'}
            </h1>

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="name" value={name} onChange={setName} placeholder="React" />
                <FormField label="imageUrl" value={imageUrl} onChange={setImageUrl} placeholder="https://... (optional icon URL)" />
                <Select label="category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />

                <Checkbox label="public" checked={isPublic} onChange={setIsPublic} />
                {!isPublic && <VisibilityWarning />}

                {error && <p className="font-mono text-xs text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <Button type="submit" disabled={submitting || name.length === 0}>
                        {submitting ? 'saving...' : 'save'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/skills')}>
                        cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
