// =============================================================================
// Select — Atom
// Same visual language as FormField (underscore-prefixed label, bordered
// box, mono font) for a fixed set of options. Separate atom rather than a
// FormField variant since <select> has no textarea-style branching and a
// different native element entirely.
// =============================================================================
interface Option {
    value: string
    label: string
}

interface Props {
    label:    string
    value:    string
    onChange: (value: string) => void
    options:  Option[]
    error?:   string
}

export function Select({ label, value, onChange, options, error }: Props) {
    const hasError = Boolean(error)

    return (
        <div className="flex flex-col gap-1.5">
            <label className="font-mono text-sm text-(--text-muted)">
                _{label}:
            </label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={[
                    'w-full bg-[rgba(1,13,24,0.6)] font-mono text-sm text-(--text-primary)',
                    'border px-4 py-3 outline-none transition-colors duration-150',
                    hasError
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-(--border-muted) focus:border-(--accent-teal)',
                ].join(' ')}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {hasError && (
                <p className="font-mono text-xs text-red-500">{error}</p>
            )}
        </div>
    )
}
