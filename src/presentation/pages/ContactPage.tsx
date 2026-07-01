'use client'
import { useState }         from 'react'
import { VSCodeLayout }     from '../templates/VSCodeLayout'
import { ContactForm }      from '../molecules/ContactForm'
import { LiveCodePreview }  from '../molecules/LiveCodePreview'
import type { SidebarItem } from '../organisms/Sidebar'
import { ContactSuccess } from '../molecules/ContactSuccess'
import { submitContactAction } from '@/app/contact/action'

// =============================================================================
// ContactPage — Page
// Two panel layout: form left, live code preview right.
// Owns all form state, validation, and success state.
// Sidebar: contacts + find-me-also-in sections.
// =============================================================================

const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        label: 'contacts',
        href:  '#',
        children: [
        { label: 'lam@example.com', href: 'mailto:lam@example.com', icon: '✉' },
        { label: '+84 000 000 000', href: 'tel:+84000000000',       icon: '📞' },
        ],
    },
    {
        label: 'find-me-also-in',
        href:  '#',
        children: [
        { label: 'GitHub',    href: 'https://github.com',    icon: '↗', external: true },
        { label: 'LinkedIn',  href: 'https://linkedin.com',  icon: '↗', external: true },
        { label: 'dev.to',    href: 'https://dev.to',        icon: '↗', external: true },
        { label: 'Instagram', href: 'https://instagram.com', icon: '↗', external: true },
        ],
    },
]

interface FormErrors {
    name?:      string
    email?:     string
    message?:   string
    turnstile?: string
}

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ContactPage() {
    const [name,            setName]            = useState('')
    const [email,           setEmail]           = useState('')
    const [message,         setMessage]         = useState('')
    const [turnstileToken,  setTurnstileToken]  = useState<string | null>(null)
    const [errors,          setErrors]          = useState<FormErrors>({})
    const [submitting,      setSubmitting]      = useState(false)
    const [submitted,       setSubmitted]       = useState(false)

    function validate(): boolean {
        const newErrors: FormErrors = {}
        if (!name.trim())               newErrors.name      = 'Name is required'
        if (!email.trim())              newErrors.email     = 'Email is required'
        else if (!validateEmail(email)) newErrors.email     = 'Wrong email address'
        if (!message.trim())            newErrors.message   = 'Message is required'
        if (!turnstileToken)            newErrors.turnstile = 'Please complete the verification'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setSubmitting(true)
        try {
            const result = await submitContactAction({
                name,
                email,
                message,
                turnstileToken: turnstileToken!,
            })

            if (result.success) {
                setSubmitted(true)
            } else {
                // We don't know which field the backend's message maps to
                // (400s can be name/email/message length violations, 429 is
                // rate limiting, 5xx is a server failure) — surface it as a
                // form-level message rather than guessing a field.
                setErrors({ message: result.error })
                // A rejected/expired token can't be reused — force a fresh
                // challenge on retry.
                setTurnstileToken(null)
            }
        } catch {
            setErrors({ message: 'Could not reach the server. Please check your connection and try again.' })
            setTurnstileToken(null)
        } finally {
            setSubmitting(false)
        }
    }

    function handleReset() {
        setName('')
        setEmail('')
        setMessage('')
        setTurnstileToken(null)
        setErrors({})
        setSubmitted(false)
    }

    function handleNameChange(v: string) {
        setName(v)
        if (errors.name) setErrors((e) => ({ ...e, name: undefined }))
    }
    function handleEmailChange(v: string) {
        setEmail(v)
        if (errors.email) setErrors((e) => ({ ...e, email: undefined }))
    }
    function handleMessageChange(v: string) {
        setMessage(v)
        if (errors.message) setErrors((e) => ({ ...e, message: undefined }))
    }

    return (
        <VSCodeLayout activeTab="contact" sidebarItems={SIDEBAR_ITEMS}>
        <div className="flex h-full overflow-hidden">

            {/* ── Left — form panel ────────────────────────────── */}
            <section className="flex-1 flex items-center justify-center p-10 overflow-y-auto">
            {submitted ? (
                <ContactSuccess onReset={handleReset} />
            ) : (
                <ContactForm
                name={name}
                email={email}
                message={message}
                errors={errors}
                submitting={submitting}
                hasTurnstileToken={Boolean(turnstileToken)}
                onNameChange={handleNameChange}
                onEmailChange={handleEmailChange}
                onMessageChange={handleMessageChange}
                onTurnstileSuccess={(token) => {
                    setTurnstileToken(token)
                    if (errors.turnstile) setErrors((e) => ({ ...e, turnstile: undefined }))
                }}
                onTurnstileExpire={() => setTurnstileToken(null)}
                onSubmit={handleSubmit}
                />
            )}
            </section>

            {/* ── Right — live code preview ─────────────────────── */}
            <section className="w-[45%] shrink-0 overflow-hidden">
            <LiveCodePreview
                name={submitted ? '' : name}
                email={submitted ? '' : email}
                message={submitted ? '' : message}
            />
            </section>

        </div>
        </VSCodeLayout>
    )
}