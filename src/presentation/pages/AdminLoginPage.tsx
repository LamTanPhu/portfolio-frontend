'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../atoms/FormField'
import { Button } from '../atoms/Button'

// =============================================================================
// AdminLoginPage — Page
// Single-admin login — password only, no email/username field (backend
// resolves identity from ADMIN_EMAIL env, not from anything sent here).
// =============================================================================
export function AdminLoginPage() {
    const { login } = useAuth()
    const router = useRouter()

    const [password, setPassword] = useState('')
    const [error, setError]       = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            await login(password)
            router.replace('/admin/blog')
        } catch {
            setError('Wrong password.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex items-center justify-center h-screen bg-(--bg-surface)">
            <form
                onSubmit={(e) => { void handleSubmit(e) }}
                className="flex flex-col gap-6 w-full max-w-sm p-8 border border-(--border-muted)"
            >
                <h1 className="font-mono text-lg text-(--text-primary)">
                    <span className="text-(--text-muted)">_</span>admin-login
                </h1>

                <FormField
                    label="password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    error={error ?? undefined}
                    placeholder="••••••••"
                />

                <Button type="submit" disabled={submitting || password.length === 0}>
                    {submitting ? 'checking...' : 'log in'}
                </Button>
            </form>
        </div>
    )
}
