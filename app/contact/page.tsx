// app/contact/page.tsx
import type { Metadata } from 'next'
import { ContactPage } from '@/src/presentation/pages/ContactPage'
import { loadSocialAccounts } from '@/src/application/use-cases/queries/social/loadSocialAccounts'
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
    const socialAccounts = await loadSocialAccounts()
    return <ContactPage socialAccounts={socialAccounts} />
}