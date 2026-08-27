'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../atoms/FormField'
import { Button } from '../atoms/Button'
import { CreateBlogCommand } from '@/src/application/use-cases/commands/blog/CreateBlogCommand'
import { UpdateBlogCommand } from '@/src/application/use-cases/commands/blog/UpdateBlogCommand'
import type { BlogDetailDTO } from '@/src/application/dtos/blog/BlogDetailDTO'

// =============================================================================
// AdminBlogFormPage — Page
// Shared create/edit form. slug is never a field here — server-generated
// from title on create, and unchanged (title-independent) on update, same
// as the backend contract (CreateBlogDto/UpdateBlogDto never accept slug).
// =============================================================================
type Props =
    | { mode: 'create' }
    | { mode: 'edit'; post: BlogDetailDTO }

export function AdminBlogFormPage(props: Props) {
    const { accessToken } = useAuth()
    const router = useRouter()

    const existing = props.mode === 'edit' ? props.post : null

    const [title, setTitle]       = useState(existing?.title ?? '')
    const [content, setContent]   = useState(existing?.content ?? '')
    const [excerpt, setExcerpt]   = useState(existing?.excerpt ?? '')
    const [tagsInput, setTagsInput] = useState(existing?.tags.join(', ') ?? '')
    const [isPublished, setIsPublished] = useState(existing?.isPublished ?? false)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
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
            router.push('/admin/blog')
        } catch {
            setError('Failed to save — check the backend is reachable and try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="font-mono text-lg text-(--text-primary) mb-6">
                <span className="text-(--text-muted)">_</span>
                {props.mode === 'create' ? 'new-post' : 'edit-post'}
            </h1>

            <form onSubmit={(e) => { void handleSubmit(e) }} className="flex flex-col gap-5">
                <FormField label="title" value={title} onChange={setTitle} />
                <FormField label="excerpt" value={excerpt} onChange={setExcerpt} placeholder="short summary for the list view" />
                <FormField label="tags" value={tagsInput} onChange={setTagsInput} placeholder="comma, separated, tags" />
                <FormField label="content" as="textarea" rows={16} value={content} onChange={setContent} placeholder="markdown content..." />

                <label className="flex items-center gap-2 font-mono text-sm text-(--text-muted) cursor-pointer w-fit">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="accent-(--accent-teal)"
                    />
                    published
                </label>

                {error && <p className="font-mono text-xs text-red-500">{error}</p>}

                <div className="flex gap-3">
                    <Button type="submit" disabled={submitting || title.length === 0 || content.length === 0}>
                        {submitting ? 'saving...' : 'save'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/blog')}>
                        cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
