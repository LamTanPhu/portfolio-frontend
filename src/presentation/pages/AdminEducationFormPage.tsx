'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../atoms/FormField'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { VisibilityWarning } from '../atoms/VisibilityWarning'
import { CreateEducationCommand } from '@/src/application/use-cases/commands/education/CreateEducationCommand'
import { UpdateEducationCommand } from '@/src/application/use-cases/commands/education/UpdateEducationCommand'
import type { EducationDTO } from '@/src/application/dtos/education/EducationDTO'

type Props =
    | { mode: 'create' }
    | { mode: 'edit'; education: EducationDTO }

export function AdminEducationFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()

    const existing = props.mode === 'edit' ? props.education : null

    const [degreeName, setDegreeName]         = useState(existing?.degreeName ?? '')
    const [instituteName, setInstituteName]   = useState(existing?.instituteName ?? '')
    const [instituteUrl, setInstituteUrl]     = useState(existing?.instituteUrl ?? '')
    const [startedAt, setStartedAt]           = useState(existing?.startedAt.slice(0, 10) ?? '')
    const [endedAt, setEndedAt]               = useState(existing?.endedAt?.slice(0, 10) ?? '')
    const [isCompleted, setIsCompleted]       = useState(existing?.isCompleted ?? false)
    const [isPublic, setIsPublic]             = useState(true)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!accessToken) return

        setSubmitting(true)
        setError(null)

        const payload = {
            degreeName,
            instituteName,
            instituteUrl: instituteUrl || null,
            startedAt,
            endedAt: endedAt || null,
            isCompleted,
            isPublic,
        }

        try {
            if (props.mode === 'create') {
                await CreateEducationCommand.create().execute(payload, accessToken)
            } else {
                await UpdateEducationCommand.create().execute(props.education.id, payload, accessToken)
            }
            router.push('/admin/education')
        } catch {
            setError('Failed to save — check the backend is reachable and try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-6">
                <span className="text-(--text-muted)">_</span>
                {props.mode === 'create' ? 'new-education' : 'edit-education'}
            </h1>

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="degreeName" value={degreeName} onChange={setDegreeName} placeholder="Bachelor of Software Engineering" />
                <FormField label="instituteName" value={instituteName} onChange={setInstituteName} placeholder="FPT University" />
                <FormField label="instituteUrl" value={instituteUrl} onChange={setInstituteUrl} placeholder="https://... (optional)" />
                <FormField label="startedAt" type="date" value={startedAt} onChange={setStartedAt} />
                <FormField label="endedAt" type="date" value={endedAt} onChange={setEndedAt} placeholder="leave blank if ongoing" />

                <Checkbox label="completed" checked={isCompleted} onChange={setIsCompleted} />
                <Checkbox label="public" checked={isPublic} onChange={setIsPublic} />
                {!isPublic && <VisibilityWarning />}

                {error && <p className="font-mono text-xs text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <Button type="submit" disabled={submitting || degreeName.length === 0 || instituteName.length === 0 || startedAt.length === 0}>
                        {submitting ? 'saving...' : 'save'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/education')}>
                        cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
