'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../atoms/FormField'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { VisibilityWarning } from '../atoms/VisibilityWarning'
import { CreateJobCommand } from '@/src/application/use-cases/commands/job/CreateJobCommand'
import { UpdateJobCommand } from '@/src/application/use-cases/commands/job/UpdateJobCommand'
import type { JobDTO } from '@/src/application/dtos/job/JobDTO'

type Props =
    | { mode: 'create' }
    | { mode: 'edit'; job: JobDTO }

export function AdminJobFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()

    const existing = props.mode === 'edit' ? props.job : null

    const [companyName, setCompanyName] = useState(existing?.companyName ?? '')
    const [role, setRole]               = useState(existing?.role ?? '')
    const [startedAt, setStartedAt]     = useState(existing?.startedAt.slice(0, 10) ?? '')
    const [endedAt, setEndedAt]         = useState(existing?.endedAt?.slice(0, 10) ?? '')
    const [isEnded, setIsEnded]         = useState(existing?.isEnded ?? false)
    const [isPublic, setIsPublic]       = useState(true)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!accessToken) return

        setSubmitting(true)
        setError(null)

        const payload = {
            companyName,
            role,
            startedAt,
            endedAt: endedAt || null,
            isEnded,
            isPublic,
        }

        try {
            if (props.mode === 'create') {
                await CreateJobCommand.create().execute(payload, accessToken)
            } else {
                await UpdateJobCommand.create().execute(props.job.id, payload, accessToken)
            }
            router.push('/admin/jobs')
        } catch {
            setError('Failed to save — check the backend is reachable and try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-6">
                <span className="text-(--text-muted)">_</span>
                {props.mode === 'create' ? 'new-job' : 'edit-job'}
            </h1>

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="companyName" value={companyName} onChange={setCompanyName} placeholder="AmazingTech Solution & Technology Ltd" />
                <FormField label="role" value={role} onChange={setRole} placeholder="Game Developer Intern" />
                <FormField label="startedAt" type="date" value={startedAt} onChange={setStartedAt} />
                <FormField label="endedAt" type="date" value={endedAt} onChange={setEndedAt} placeholder="leave blank if current" />

                <Checkbox label="ended" checked={isEnded} onChange={setIsEnded} />
                <Checkbox label="public" checked={isPublic} onChange={setIsPublic} />
                {!isPublic && <VisibilityWarning />}

                {error && <p className="font-mono text-xs text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <Button type="submit" disabled={submitting || companyName.length === 0 || role.length === 0 || startedAt.length === 0}>
                        {submitting ? 'saving...' : 'save'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/jobs')}>
                        cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
