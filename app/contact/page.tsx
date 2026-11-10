// app/contact/page.tsx
import type { Metadata } from 'next'
import { ContactPage } from '@/src/presentation/pages/ContactPage'
import { loadPublicSocialAccounts } from '@/src/application/use-cases/queries/social/loadPublicSocialAccounts'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
    title:       'Contact',
    description: 'Get in touch with Lam Tan Phu — Software Engineer.',
    alternates:  { canonical: `${SITE_URL}/contact` },
    openGraph: {
        title:       'Contact — Lam Tan Phu',
        description: 'Get in touch with Lam Tan Phu — Software Engineer.',
        url:         `${SITE_URL}/contact`,
        type:        'website',
    },
    twitter: {
        card:        'summary',
        title:       'Contact — Lam Tan Phu',
        description: 'Get in touch with Lam Tan Phu — Software Engineer.',
    },
}

export default async function Page() {
    const socialAccounts = await loadPublicSocialAccounts()
    return <ContactPage socialAccounts={socialAccounts} />
}