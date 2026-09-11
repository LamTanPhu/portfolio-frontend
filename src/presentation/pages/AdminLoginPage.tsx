'use client'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
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

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            await login(password)
            router.replace('/admin')
        } catch {
            setError('Wrong password.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex items-center justify-center h-screen bg-(--bg-surface) glow-bg">
            <form
                onSubmit={(e) => { void handleSubmit(e) }}
                className="flex flex-col gap-6 w-full max-w-sm p-8 border border-(--border-muted) bg-(--bg-elevated)/40 backdrop-blur-sm"
            >
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 border border-(--border-muted) text-(--accent-teal) bg-(--bg-elevated)">
                        <ShieldCheck size={18} />
                    </span>
                    <div className="flex flex-col">
                        <h1 className="font-mono text-base text-(--text-primary)">
                            <span className="text-(--text-muted)">_</span>admin-login
                        </h1>
                        <span className="font-mono text-[11px] text-(--text-muted)">restricted area</span>
                    </div>
                </div>

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
