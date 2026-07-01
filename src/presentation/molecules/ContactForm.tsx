'use client'
import { Turnstile } from '@marsidev/react-turnstile'
import { FormField } from '../atoms/FormField'
import { TURNSTILE_SITE_KEY } from '@/lib/constants'

// =============================================================================
// ContactForm — Molecule
// Three fields: name, email, message. Validation errors per field.
// Turnstile widget sits above the submit button — the backend's
// TurnstileGuard rejects the submission outright without a valid token, so
// the button stays disabled until one is issued.
// submit-message button, amber style matching Figma.
// =============================================================================

interface FormErrors {
    name?:      string
    email?:     string
    message?:   string
    turnstile?: string
}

interface Props {
    name:      string
    email:     string
    message:   string
    errors:    FormErrors
    submitting: boolean
    hasTurnstileToken: boolean
    onNameChange:      (v: string) => void
    onEmailChange:     (v: string) => void
    onMessageChange:   (v: string) => void
    onTurnstileSuccess: (token: string) => void
    onTurnstileExpire:  () => void
    onSubmit:           () => void
}

export function ContactForm({
    name, email, message, errors, submitting, hasTurnstileToken,
    onNameChange, onEmailChange, onMessageChange,
    onTurnstileSuccess, onTurnstileExpire, onSubmit,
}: Props) {
    return (
        <div className="flex flex-col gap-6 w-full max-w-sm">

        <FormField
            label="name"
            value={name}
            onChange={onNameChange}
            error={errors.name}
        />

        <FormField
            label="email"
            as="input"
            type="email"
            value={email}
            onChange={onEmailChange}
            error={errors.email}
        />

        <FormField
            label="message"
            as="textarea"
            value={message}
            onChange={onMessageChange}
            error={errors.message}
            rows={6}
        />

        <div className="flex flex-col gap-1.5">
            <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                options={{ theme: 'dark' }}
                onSuccess={onTurnstileSuccess}
                onExpire={onTurnstileExpire}
                onError={onTurnstileExpire}
            />
            {errors.turnstile && (
                <p className="font-mono text-xs text-red-500">{errors.turnstile}</p>
            )}
        </div>

        <button
            onClick={onSubmit}
            disabled={submitting || !hasTurnstileToken}
            className="font-mono text-sm font-semibold px-6 py-2.5 w-fit bg-(--accent-amber) text-[#010d18] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {submitting ? 'sending...' : 'submit-message'}
        </button>

        </div>
    )
}