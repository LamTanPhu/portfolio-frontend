// =============================================================================
// FormField — Atom
// Label with underscore prefix, input or textarea, error state.
// Error: red border, warning icon inside field, red message below.
// =============================================================================

interface BaseProps {
    label:        string
    value:        string
    onChange:     (value: string) => void
    error?:       string
    placeholder?: string
}

interface InputProps extends BaseProps {
    as?: 'input'
    type?: 'text' | 'email'
}

interface TextareaProps extends BaseProps {
    as: 'textarea'
    rows?: number
}

type Props = InputProps | TextareaProps

export function FormField(props: Props) {
    const { label, value, onChange, error, placeholder } = props
    const hasError = Boolean(error)

    const baseClass = [
        'w-full bg-[rgba(1,13,24,0.6)] font-mono text-sm text-(--text-primary)',
        'border px-4 py-3 outline-none transition-colors duration-150',
        'placeholder:text-(--text-muted)',
        hasError
        ? 'border-red-500 focus:border-red-400'
        : 'border-(--border-muted) focus:border-(--accent-teal)',
    ].join(' ')

    return (
        <div className="flex flex-col gap-1.5">

        {/* Label */}
        <label className="font-mono text-sm text-(--text-muted)">
            _{label}:
        </label>

        {/* Input or textarea */}
        <div className="relative">
            {props.as === 'textarea' ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder ?? `your ${label} here ...`}
                rows={props.rows ?? 5}
                className={baseClass + ' resize-none'}
            />
            ) : (
            <input
                type={(props as InputProps).type ?? 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={baseClass + ' pr-10'}
            />
            )}

            {/* Error icon — only for single-line inputs */}
            {hasError && props.as !== 'textarea' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">
                ⊘
            </span>
            )}
        </div>

        {/* Error message */}
        {hasError && (
            <p className="font-mono text-xs text-red-500">{error}</p>
        )}

        </div>
    )
}