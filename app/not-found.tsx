// app/not-found.tsx
// Next's own not-found convention — fires whenever notFound() is called
// (see app/blog/[slug]/page.tsx, app/projects/[slug]/page.tsx) or a route
// simply doesn't exist. Without this file Next falls back to its plain
// default screen, which breaks the VS Code theme every other page keeps.
import type { Metadata } from 'next'
import Link from 'next/link'
import { VSCodeLayout } from '@/src/presentation/templates/VSCodeLayout'
import { Button } from '@/src/presentation/atoms/Button'

export const metadata: Metadata = {
    title: '404',
}

export default function NotFound() {
    return (
        <VSCodeLayout activeTab="404" showSidebar={false}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] lg:h-full gap-4 p-6 text-center glow-bg">
                <p className="font-mono text-xs text-(--text-comment)">{'// 404'}</p>

                <h1 className="font-mono text-xl sm:text-2xl text-(--text-primary)">
                    Cannot resolve module <span className="text-(--accent-amber)">&apos;{'{this-page}'}&apos;</span>
                </h1>

                <p className="font-mono text-sm text-(--text-muted) max-w-md">
                    This route doesn&apos;t exist — it may have been moved, renamed, or the URL has a typo.
                </p>

                <Link href="/" className="mt-2">
                    <Button className="flex items-center gap-2">
                        cd ~ &amp;&amp; open home
                    </Button>
                </Link>
            </div>
        </VSCodeLayout>
    )
}
