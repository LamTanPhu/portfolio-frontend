'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ScrollText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FormField } from '../atoms/FormField'
import { Checkbox } from '../atoms/Checkbox'
import { AdminPageHeader } from '../molecules/AdminPageHeader'
import { AdminFormActions } from '../molecules/AdminFormActions'
import { CreateBlogCommand } from '@/src/application/use-cases/commands/blog/CreateBlogCommand'
import { UpdateBlogCommand } from '@/src/application/use-cases/commands/blog/UpdateBlogCommand'
import type { BlogDetailDTO } from '@/src/application/dtos/blog/BlogDetailDTO'

// =============================================================================
// AdminBlogFormPage — Page
// Shared create/edit form. slug is never a field here — server-generated
// from title on create, and unchanged (title-independent) on update, same
// as the backend contract (CreateBlogDto/UpdateBlogDto never accept slug).
// No VisibilityWarning here — unlike the other about-page resources, Blog
// has a real admin listing endpoint (/blogs/admin) that shows drafts too,
// so unpublishing a post never loses it.
// =============================================================================
type Props =
    | { mode: 'create' }
    | { mode: 'edit'; post: BlogDetailDTO }

export function AdminBlogFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()
    const toast = useToast()

    const existing = props.mode === 'edit' ? props.post : null

    const [title, setTitle]       = useState(existing?.title ?? '')
    const [content, setContent]   = useState(existing?.content ?? '')
    const [excerpt, setExcerpt]   = useState(existing?.excerpt ?? '')
    const [tagsInput, setTagsInput] = useState(existing?.tags.join(', ') ?? '')
    const [isPublished, setIsPublished] = useState(existing?.isPublished ?? false)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (!accessToken) return // AdminShell guarantees authenticated status, this is just a type guard

        setSubmitting(true)
        setError(null)

        const tags = tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0)

        try {
            if (props.mode === 'create') {
                await CreateBlogCommand.create().execute(
                    { title, content, excerpt: excerpt || null, tags, isPublished },
                    accessToken,
                )
            } else {
                await UpdateBlogCommand.create().execute(
                    props.post.id,
                    { title, content, excerpt: excerpt || null, tags, isPublished },
                    accessToken,
                )
            }
            toast.show(`Saved "${title}".`, 'success')
            router.push('/admin/blog')
        } catch {
            setError('Failed to save — check the backend is reachable.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <AdminPageHeader
                icon={<ScrollText size={16} />}
                title={props.mode === 'create' ? 'new-post' : 'edit-post'}
            />

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="title" value={title} onChange={setTitle} />
                <FormField label="excerpt" value={excerpt} onChange={setExcerpt} placeholder="short summary for the list view" />
                <FormField label="tags" value={tagsInput} onChange={setTagsInput} placeholder="comma, separated, tags" />
                <FormField label="content" as="textarea" rows={16} value={content} onChange={setContent} placeholder="markdown content..." />

                <Checkbox label="published" checked={isPublished} onChange={setIsPublished} />

                <AdminFormActions
                    submitting={submitting}
                    canSubmit={title.length > 0 && content.length > 0}
                    error={error}
                    onCancel={() => router.push('/admin/blog')}
                />
            </form>
        </div>
    )
}
