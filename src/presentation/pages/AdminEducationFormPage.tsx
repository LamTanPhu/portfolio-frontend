'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FormField } from '../atoms/FormField'
import { Checkbox } from '../atoms/Checkbox'
import { VisibilityWarning } from '../atoms/VisibilityWarning'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { AdminFormActions } from '../molecules/AdminFormActions'
import { CreateEducationCommand } from '@/src/application/use-cases/commands/education/CreateEducationCommand'
import { UpdateEducationCommand } from '@/src/application/use-cases/commands/education/UpdateEducationCommand'
import type { EducationDTO } from '@/src/application/dtos/education/EducationDTO'

type Props =
    | { mode: 'create' }
    | { mode: 'edit'; education: EducationDTO }

export function AdminEducationFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()
    const toast = useToast()

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
            toast.show(`Saved "${degreeName}".`, 'success')
            router.push('/admin/education')
        } catch {
            setError('Failed to save — check the backend is reachable.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <AdminPageHeader
                icon={<GraduationCap size={16} />}
                title={props.mode === 'create' ? 'new-education' : 'edit-education'}
            />

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="degreeName" value={degreeName} onChange={setDegreeName} placeholder="Bachelor of Software Engineering" />
                <FormField label="instituteName" value={instituteName} onChange={setInstituteName} placeholder="FPT University" />
                <FormField label="instituteUrl" value={instituteUrl} onChange={setInstituteUrl} placeholder="https://... (optional)" />
                <div className="grid grid-cols-2 gap-5">
                    <FormField label="startedAt" type="date" value={startedAt} onChange={setStartedAt} />
                    <FormField label="endedAt" type="date" value={endedAt} onChange={setEndedAt} placeholder="leave blank if ongoing" />
                </div>

                <Checkbox label="completed" checked={isCompleted} onChange={setIsCompleted} />
                <Checkbox label="public" checked={isPublic} onChange={setIsPublic} />
                {!isPublic && <VisibilityWarning />}

                <AdminFormActions
                    submitting={submitting}
                    canSubmit={degreeName.length > 0 && instituteName.length > 0 && startedAt.length > 0}
                    error={error}
                    onCancel={() => router.push('/admin/education')}
                />
            </form>
        </div>
    )
}
