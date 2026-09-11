'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FormField } from '../atoms/FormField'
import { Checkbox } from '../atoms/Checkbox'
import { VisibilityWarning } from '../atoms/VisibilityWarning'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { AdminFormActions } from '../molecules/AdminFormActions'
import { CreateCertificationCommand } from '@/src/application/use-cases/commands/certification/CreateCertificationCommand'
import { UpdateCertificationCommand } from '@/src/application/use-cases/commands/certification/UpdateCertificationCommand'
import type { CertificationDTO } from '@/src/application/dtos/certification/CertificationDTO'

// =============================================================================
// AdminCertificationFormPage — Page
// isPublished is write-only (see CreateCertificationRequestDTO comment) —
// the read DTO never returns it, so editing an existing certification
// always starts the toggle at true (the only state a fetched record can be
// in, since the list itself is published-filtered).
// =============================================================================
type Props =
    | { mode: 'create' }
    | { mode: 'edit'; certification: CertificationDTO }

export function AdminCertificationFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()
    const toast = useToast()

    const existing = props.mode === 'edit' ? props.certification : null

    const [name, setName]           = useState(existing?.name ?? '')
    const [url, setUrl]             = useState(existing?.url ?? '')
    const [startDate, setStartDate] = useState(existing?.startDate.slice(0, 10) ?? '')
    const [endDate, setEndDate]     = useState(existing?.endDate?.slice(0, 10) ?? '')
    const [isPublished, setIsPublished] = useState(true)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!accessToken) return

        setSubmitting(true)
        setError(null)

        const payload = {
            name,
            url,
            startDate,
            endDate: endDate || null,
            isPublished,
        }

        try {
            if (props.mode === 'create') {
                await CreateCertificationCommand.create().execute(payload, accessToken)
            } else {
                await UpdateCertificationCommand.create().execute(props.certification.id, payload, accessToken)
            }
            toast.show(`Saved "${name}".`, 'success')
            router.push('/admin/certifications')
        } catch {
            setError('Failed to save — check the backend is reachable.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <AdminPageHeader
                icon={<Award size={16} />}
                title={props.mode === 'create' ? 'new-certification' : 'edit-certification'}
            />

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="name" value={name} onChange={setName} placeholder="AWS Certified Solutions Architect" />
                <FormField label="url" value={url} onChange={setUrl} placeholder="https://..." />
                <div className="grid grid-cols-2 gap-5">
                    <FormField label="startDate" type="date" value={startDate} onChange={setStartDate} />
                    <FormField label="endDate" type="date" value={endDate} onChange={setEndDate} placeholder="leave blank if no expiry" />
                </div>

                <Checkbox label="published" checked={isPublished} onChange={setIsPublished} />
                {!isPublished && <VisibilityWarning />}

                <AdminFormActions
                    submitting={submitting}
                    canSubmit={name.length > 0 && url.length > 0 && startDate.length > 0}
                    error={error}
                    onCancel={() => router.push('/admin/certifications')}
                />
            </form>
        </div>
    )
}
