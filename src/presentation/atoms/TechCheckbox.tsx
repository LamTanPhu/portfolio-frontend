import type { ReactNode } from 'react'

// =============================================================================
// TechCheckbox — Atom
// Single technology filter item: checkbox + icon + label.
// Icon is passed as a ReactNode so the parent controls which react-icon to use.
// =============================================================================

interface Props {
    label:     string
    icon:      ReactNode
    checked:   boolean
    onChange:  (label: string) => void
}

export function TechCheckbox({ label, icon, checked, onChange }: Props) {
    return (
        <label className="flex items-center gap-3 px-3 py-1.5 rounded-sm cursor-pointer hover:bg-(--bg-elevated) transition-colors duration-100 group">

        {/* Checkbox */}
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

        {/* Tech icon */}
        <span className={[
            'text-base transition-colors duration-100',
            checked ? 'text-(--text-primary)' : 'text-(--text-muted) group-hover:text-(--text-primary)',
        ].join(' ')}>
            {icon}
        </span>

        {/* Label */}
        <span className={[
            'font-mono text-[13px] transition-colors duration-100',
            checked ? 'text-(--text-primary)' : 'text-(--text-muted) group-hover:text-(--text-primary)',
        ].join(' ')}>
            {label}
        </span>

        {/* Hidden native checkbox for accessibility */}
        <input
            type="checkbox"
            checked={checked}
            onChange={() => onChange(label)}
            className="sr-only"
        />
        </label>
    )
}