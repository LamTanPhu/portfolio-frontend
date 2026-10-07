// Small factories for API-shaped DTOs. Every field has a sensible default and
// any of them can be overridden per test: blogSummaryDTO({ tags: ['a', 'b'] }).
import type { BlogDetailDTO } from '@/src/application/dtos/blog/BlogDetailDTO'
import type { BlogSummaryDTO } from '@/src/application/dtos/blog/BlogSummaryDTO'
import type { CertificationDTO } from '@/src/application/dtos/certification/CertificationDTO'
import type { EducationDTO } from '@/src/application/dtos/education/EducationDTO'
import type { JobDTO } from '@/src/application/dtos/job/JobDTO'
import type { ProjectDTO } from '@/src/application/dtos/project/ProjectDTO'
import type { ProjectSummaryDTO } from '@/src/application/dtos/project/ProjectSummaryDTO'
import type { SkillDTO } from '@/src/application/dtos/skill/SkillDTO'
import type { SocialAccountDTO } from '@/src/application/dtos/socialAccount/SocialAccountDTO'
import type { UserProfileDTO } from '@/src/application/dtos/UserProfileDTO'

export const blogSummaryDTO = (o: Partial<BlogSummaryDTO> = {}): BlogSummaryDTO => ({
    id: 1,
    title: 'Hello World',
    slug: 'hello-world',
    excerpt: 'A short excerpt about the post.',
    tags: ['react'],
    isPublished: true,
    publishedAt: '2025-03-01T10:00:00.000Z',
    createdAt: '2025-02-28T09:00:00.000Z',
    // no updatedAt: the real backend does not send one for blog posts
    ...o,
})

export const blogDetailDTO = (o: Partial<BlogDetailDTO> = {}): BlogDetailDTO => ({
    ...blogSummaryDTO(),
    content: '# Hello\n\nFull post body.',
    ...o,
})

export const projectSummaryDTO = (o: Partial<ProjectSummaryDTO> = {}): ProjectSummaryDTO => ({
    id: 1,
    name: 'Portfolio',
    slug: 'portfolio',
    techStack: ['Next.js', 'NestJS'],
    repoUrl: 'https://github.com/example/portfolio',
    liveUrl: 'https://example.dev',
    thumbnailUrl: 'https://example.dev/thumb.png',
    isPublished: true,
    isOpenSource: true,
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2025-01-12T08:30:00.000Z',
    ...o,
})

export const projectDTO = (o: Partial<ProjectDTO> = {}): ProjectDTO => ({
    ...projectSummaryDTO(),
    description: 'A personal portfolio site.',
    ...o,
})

export const skillDTO = (o: Partial<SkillDTO> = {}): SkillDTO => ({
    id: 1,
    name: 'TypeScript',
    imageUrl: 'https://example.dev/ts.svg',
    category: 'frontend',
    ...o,
})

export const certificationDTO = (o: Partial<CertificationDTO> = {}): CertificationDTO => ({
    id: 1,
    name: 'AWS Certified Developer',
    url: 'https://example.dev/cert',
    startDate: '2024-05-01T00:00:00.000Z',
    endDate: '2027-05-01T00:00:00.000Z',
    ...o,
})

export const educationDTO = (o: Partial<EducationDTO> = {}): EducationDTO => ({
    id: 1,
    degreeName: 'BSc Computer Science',
    instituteName: 'Example University',
    instituteUrl: 'https://example.edu',
    startedAt: '2019-09-01T00:00:00.000Z',
    endedAt: '2023-06-30T00:00:00.000Z',
    isCompleted: true,
    ...o,
})

export const jobDTO = (o: Partial<JobDTO> = {}): JobDTO => ({
    id: 1,
    companyName: 'Acme Corp',
    role: 'Software Engineer',
    startedAt: '2023-07-01T00:00:00.000Z',
    endedAt: null,
    isEnded: false,
    ...o,
})

export const socialAccountDTO = (o: Partial<SocialAccountDTO> = {}): SocialAccountDTO => ({
    id: 1,
    name: 'GitHub',
    url: 'https://github.com/example',
    imageUrl: null,
    isPublic: true,
    ...o,
})

export const userProfileDTO = (o: Partial<UserProfileDTO> = {}): UserProfileDTO => ({
    id: 1,
    firstname: 'Phu',
    lastname: 'Lam',
    email: 'phu@example.dev',
    aboutme: 'Software engineer.',
    lastLogin: '2025-04-01T12:00:00.000Z',
    ...o,
})
