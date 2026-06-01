import { FormField } from '../atoms/FormField'

// =============================================================================
// ContactForm — Molecule
// Three fields: name, email, message. Validation errors per field.
// submit-message button, amber style matching Figma.
// =============================================================================

interface FormErrors {
    name?:    string
    email?:   string
    message?: string
}

interface Props {
    name:      string
    email:     string
    message:   string
    errors:    FormErrors
    submitting: boolean
    onNameChange:    (v: string) => void
    onEmailChange:   (v: string) => void
    onMessageChange: (v: string) => void
    onSubmit:        () => void
}

export function ContactForm({
    name, email, message, errors, submitting,
    onNameChange, onEmailChange, onMessageChange, onSubmit,
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

        <button
            onClick={onSubmit}
            disabled={submitting}
            className="font-mono text-sm font-semibold px-6 py-2.5 w-fit bg-(--accent-amber) text-[#010d18] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {submitting ? 'sending...' : 'submit-message'}
        </button>

        </div>
    )
}