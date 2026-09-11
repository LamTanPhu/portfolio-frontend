import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

interface Props {
    message:  string
    backHref: string
    backLabel: string
}

export function AdminNotFound({ message, backHref, backLabel }: Props) {
    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-(--border-muted)">
                <FileQuestion size={28} className="text-(--text-muted)" />
                <p className="font-mono text-sm text-(--text-muted) text-center max-w-sm px-4">
                    {message}
                </p>
                <Link href={backHref} className="font-mono text-xs text-(--accent-teal) hover:underline">
                    ← {backLabel}
                </Link>
            </div>
        </div>
    )
}
