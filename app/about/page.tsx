// app/about/page.tsx
import type { Metadata } from 'next'
import { AboutPage } from '@/src/presentation/pages/AboutPage'
import { loadSkills } from '@/src/application/use-cases/queries/skill/loadSkills'
import { loadEducation } from '@/src/application/use-cases/queries/education/loadEducation'
import { loadJobs } from '@/src/application/use-cases/queries/job/loadJobs'
import { loadCertifications } from '@/src/application/use-cases/queries/certification/loadCertification'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
    title:       'About',
    description: 'Background, skills, education, and work experience of Lam Tan Phu — Software Engineer.',
    alternates:  { canonical: `${SITE_URL}/about` },
}

export default async function Page() {
    const [skills, education, jobs, certifications] = await Promise.all([
        loadSkills(),
        loadEducation(),
        loadJobs(),
        loadCertifications(),
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