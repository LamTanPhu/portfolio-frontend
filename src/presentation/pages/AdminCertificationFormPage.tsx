'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../atoms/FormField'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { VisibilityWarning } from '../atoms/VisibilityWarning'
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
            router.push('/admin/certifications')
        } catch {
            setError('Failed to save — check the backend is reachable and try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-6">
                <span className="text-(--text-muted)">_</span>
                {props.mode === 'create' ? 'new-certification' : 'edit-certification'}
            </h1>

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="name" value={name} onChange={setName} placeholder="AWS Certified Solutions Architect" />
                <FormField label="url" value={url} onChange={setUrl} placeholder="https://..." />
                <FormField label="startDate" type="date" value={startDate} onChange={setStartDate} />
                <FormField label="endDate" type="date" value={endDate} onChange={setEndDate} placeholder="leave blank if no expiry" />

                <Checkbox label="published" checked={isPublished} onChange={setIsPublished} />
                {!isPublished && <VisibilityWarning />}

                {error && <p className="font-mono text-xs text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <Button type="submit" disabled={submitting || name.length === 0 || url.length === 0 || startDate.length === 0}>
                        {submitting ? 'saving...' : 'save'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/certifications')}>
                        cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
