import type { MetadataRoute } from 'next'
import { loadProjects } from '@/src/application/use-cases/queries/project/loadProjects'
import { loadBlogs }    from '@/src/application/use-cases/queries/blog/loadBlogs'
import { SITE_URL }     from '@/lib/constants'

// =============================================================================
// sitemap.ts
// Served at /sitemap.xml. Static routes + one entry per published project
// and blog post. If either backend call fails, that section is skipped
// rather than failing the whole sitemap — a partial sitemap beats none.
// =============================================================================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`,         changeFrequency: 'monthly', priority: 1.0 },
        { url: `${SITE_URL}/about`,    changeFrequency: 'monthly', priority: 0.8 },
        { url: `${SITE_URL}/projects`, changeFrequency: 'weekly',  priority: 0.8 },
        { url: `${SITE_URL}/blog`,     changeFrequency: 'weekly',  priority: 0.8 },
        { url: `${SITE_URL}/contact`,  changeFrequency: 'yearly',  priority: 0.5 },
    ]

    const [projects, posts] = await Promise.all([
        loadProjects().catch(() => []),
        loadBlogs().catch(() => []),
    ])

    const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
        url:            `${SITE_URL}/projects/${p.slug}`,
        lastModified:   p.updatedAt,
        changeFrequency: 'monthly',
        priority:       0.6,
    }))

    const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
        url:            `${SITE_URL}/blog/${p.slug}`,
        lastModified:   p.updatedAt,
        changeFrequency: 'monthly',
        priority:       0.6,
    }))

    return [...staticRoutes, ...projectRoutes, ...blogRoutes]
}