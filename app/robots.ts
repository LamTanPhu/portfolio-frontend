import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

// =============================================================================
// robots.ts
// Served at /robots.txt. Allows all crawlers, points to the dynamic sitemap.
// =============================================================================
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow:     '/',
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}