// =============================================================================
// Checkbox — Atom
// Plain boolean toggle, same visual language as TechCheckbox (border-muted
// -> accent-teal + checkmark) minus the icon+multi-select shape that atom
// is built for. Use this for a single yes/no field; use TechCheckbox for a
// filterable list of labeled options.
// =============================================================================
interface Props {
    label:    string
    checked:  boolean
    onChange: (checked: boolean) => void
}

export function Checkbox({ label, checked, onChange }: Props) {
    return (
        <label className="flex items-center gap-2 cursor-pointer w-fit group">
            <span className={[
                'flex items-center justify-center w-4 h-4 shrink-0 border transition-colors duration-100',
                checked
                    ? 'border-(--accent-teal) bg-(--accent-teal)'
                    : 'border-(--border-muted) bg-transparent group-hover:border-(--text-muted)',
            ].join(' ')}>
                {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#010d18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </span>
            <span className="font-mono text-sm text-(--text-muted)">{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
        </label>
    )
}
