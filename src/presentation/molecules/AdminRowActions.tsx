'use client'
import Link from 'next/link'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

interface Props {
    editHref:   string
    onDelete:   () => void
    deleting?:  boolean
}

export function AdminRowActions({ editHref, onDelete, deleting }: Props) {
    return (
        <>
            <Link
                href={editHref}
                title="edit"
                className="flex items-center justify-center w-7 h-7 text-(--text-muted) hover:text-(--accent-teal) hover:bg-(--bg-surface) transition-colors"
            >
                <Pencil size={14} />
            </Link>
            <button
                type="button"
                title="delete"
                disabled={deleting}
                onClick={onDelete}
                className="flex items-center justify-center w-7 h-7 text-(--text-muted) hover:text-red-400 hover:bg-(--bg-surface) transition-colors disabled:opacity-50"
            >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
        </>
    )
}
