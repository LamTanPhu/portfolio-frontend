// app/blog/page.tsx
import type { Metadata } from 'next'
import { BlogPage } from '@/src/presentation/pages/BlogPage'
import { loadBlogs } from '@/src/application/use-cases/queries/blog/loadBlogs'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
    title:       'Blog',
    description: 'Technical articles and notes from Lam Tan Phu on software engineering, architecture, and development.',
    alternates:  { canonical: `${SITE_URL}/blog` },
}

export default async function Page() {
    const posts = await loadBlogs()
    return <BlogPage posts={posts} />
}