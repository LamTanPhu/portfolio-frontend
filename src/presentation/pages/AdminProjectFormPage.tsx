'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../atoms/FormField'
import { Button } from '../atoms/Button'
import { Checkbox } from '../atoms/Checkbox'
import { VisibilityWarning } from '../atoms/VisibilityWarning'
import { CreateProjectCommand } from '@/src/application/use-cases/commands/project/CreateProjectCommand'
import { UpdateProjectCommand } from '@/src/application/use-cases/commands/project/UpdateProjectCommand'
import type { ProjectDTO } from '@/src/application/dtos/project/ProjectDTO'

// =============================================================================
// AdminProjectFormPage — Page
// slug is never a field here — server-generated from name, same contract
// as Blog's title→slug. isPublished carries the same VisibilityWarning as
// the other about-page resources: no admin "everything" listing exists for
// projects either, so unpublishing one here removes it from every list this
// UI can query (though it stays reachable by slug — see the edit route).
// =============================================================================
type Props =
    | { mode: 'create' }
    | { mode: 'edit'; project: ProjectDTO }

export function AdminProjectFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()

    const existing = props.mode === 'edit' ? props.project : null

    const [name, setName]               = useState(existing?.name ?? '')
    const [description, setDescription] = useState(existing?.description ?? '')
    const [techStackInput, setTechStackInput] = useState(existing?.techStack.join(', ') ?? '')
    const [repoUrl, setRepoUrl]         = useState(existing?.repoUrl ?? '')
    const [liveUrl, setLiveUrl]         = useState(existing?.liveUrl ?? '')
    const [thumbnailUrl, setThumbnailUrl] = useState(existing?.thumbnailUrl ?? '')
    const [isOpenSource, setIsOpenSource] = useState(existing?.isOpenSource ?? true)
    const [isPublished, setIsPublished]   = useState(existing?.isPublished ?? false)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!accessToken) return

        setSubmitting(true)
        setError(null)

        const techStack = techStackInput
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)

        const payload = {
            name,
            description,
            techStack,
            isOpenSource,
            isPublished,
            repoUrl: repoUrl || null,
            liveUrl: liveUrl || null,
            thumbnailUrl: thumbnailUrl || null,
        }

        try {
            if (props.mode === 'create') {
                await CreateProjectCommand.create().execute(payload, accessToken)
            } else {
                await UpdateProjectCommand.create().execute(props.project.id, payload, accessToken)
            }
            router.push('/admin/projects')
        } catch {
            setError('Failed to save — check the backend is reachable and try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-6">
                <span className="text-(--text-muted)">_</span>
                {props.mode === 'create' ? 'new-project' : 'edit-project'}
            </h1>

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="name" value={name} onChange={setName} placeholder="Electric Motorcycle Rental System" />
                <FormField label="description" as="textarea" rows={8} value={description} onChange={setDescription} />
                <FormField label="techStack" value={techStackInput} onChange={setTechStackInput} placeholder="React Native, TypeScript, NestJS" />
                <FormField label="repoUrl" value={repoUrl} onChange={setRepoUrl} placeholder="https://github.com/... (optional)" />
                <FormField label="liveUrl" value={liveUrl} onChange={setLiveUrl} placeholder="https://... (optional)" />
                <FormField label="thumbnailUrl" value={thumbnailUrl} onChange={setThumbnailUrl} placeholder="https://... (optional)" />

                <Checkbox label="open source" checked={isOpenSource} onChange={setIsOpenSource} />
                <Checkbox label="published" checked={isPublished} onChange={setIsPublished} />
                {!isPublished && <VisibilityWarning />}

                {error && <p className="font-mono text-xs text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <Button type="submit" disabled={submitting || name.length === 0 || description.length === 0}>
                        {submitting ? 'saving...' : 'save'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/projects')}>
                        cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
