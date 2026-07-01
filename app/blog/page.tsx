// app/blog/page.tsx
import { BlogPage } from '@/src/presentation/pages/BlogPage'
import { loadBlogs } from '@/src/application/use-cases/queries/blog/loadBlogs'

export default async function Page() {
    const posts = await loadBlogs()
    return <BlogPage posts={posts} />
}