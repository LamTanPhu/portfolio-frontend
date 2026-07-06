'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { TrackPageViewCommand } from '@/src/application/use-cases/commands/analytics/TrackPageViewCommand'

// =============================================================================
// PageViewTracker
// Fires a page-view ping on mount and on every client-side route change.
// Renders nothing — mounted once in the root layout, not per-page.
//
// Why client-side and not in the Server Component page files: /blog/[slug]
// and /projects/[slug] are statically generated (generateStaticParams), so
// any tracking call made in the page component itself would only run at
// build time, not per real visitor. usePathname + useEffect is the only
// way to get one ping per actual page load in an app using SSG.
// =============================================================================
export function PageViewTracker() {
    const pathname = usePathname()

    useEffect(() => {
        TrackPageViewCommand.create().execute(pathname)
    }, [pathname])

    return null
}