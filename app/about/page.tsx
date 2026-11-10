// app/about/page.tsx
import type { Metadata } from 'next'
import { AboutPage } from '@/src/presentation/pages/AboutPage'
import { loadPublicSkills } from '@/src/application/use-cases/queries/skill/loadPublicSkills'
import { loadPublicEducation } from '@/src/application/use-cases/queries/education/loadPublicEducation'
import { loadPublicJobs } from '@/src/application/use-cases/queries/job/loadPublicJobs'
import { loadPublicCertifications } from '@/src/application/use-cases/queries/certification/loadPublicCertifications'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
    title:       'About',
    description: 'Background, skills, education, and work experience of Lam Tan Phu — Software Engineer.',
    alternates:  { canonical: `${SITE_URL}/about` },
    openGraph: {
        title:       'About — Lam Tan Phu',
        description: 'Background, skills, education, and work experience of Lam Tan Phu — Software Engineer.',
        url:         `${SITE_URL}/about`,
        type:        'website',
    },
    twitter: {
        card:        'summary',
        title:       'About — Lam Tan Phu',
        description: 'Background, skills, education, and work experience of Lam Tan Phu — Software Engineer.',
    },
}

export default async function Page() {
    const [skills, education, jobs, certifications] = await Promise.all([
        loadPublicSkills(),
        loadPublicEducation(),
        loadPublicJobs(),
        loadPublicCertifications(),
    ])

    return (
        <AboutPage
            skills={skills}
            education={education}
            jobs={jobs}
            certifications={certifications}
        />
    )
}