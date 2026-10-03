import { describe, expect, it } from 'vitest'
import { Project, ProjectSummary } from '@/src/domain/entities/Project'
import { projectDTO, projectSummaryDTO } from '@/src/test/fixtures'
import { ProjectMapper } from './ProjectMapper'

describe('ProjectMapper', () => {
    describe('toDomainSummary', () => {
        it('maps a list-view DTO to a ProjectSummary entity', () => {
            const summary = ProjectMapper.toDomainSummary(
                projectSummaryDTO({ id: 3, name: 'X', slug: 'x', techStack: ['Go'], isOpenSource: false }),
            )

            expect(summary).toBeInstanceOf(ProjectSummary)
            expect(summary).toMatchObject({ id: 3, name: 'X', slug: 'x', techStack: ['Go'], isOpenSource: false })
        })

        it('converts createdAt/updatedAt to Date objects', () => {
            const summary = ProjectMapper.toDomainSummary(
                projectSummaryDTO({ createdAt: '2025-01-10T08:00:00.000Z', updatedAt: '2025-01-12T08:30:00.000Z' }),
            )

            expect(summary.createdAt).toBeInstanceOf(Date)
            expect(summary.updatedAt.toISOString()).toBe('2025-01-12T08:30:00.000Z')
        })

        it('passes null repo/live/thumbnail URLs through untouched', () => {
            const summary = ProjectMapper.toDomainSummary(
                projectSummaryDTO({ repoUrl: null, liveUrl: null, thumbnailUrl: null }),
            )

            expect(summary.repoUrl).toBeNull()
            expect(summary.liveUrl).toBeNull()
            expect(summary.thumbnailUrl).toBeNull()
        })
    })

    describe('toDomain', () => {
        it('maps a detail DTO to a Project entity including the description', () => {
            const project = ProjectMapper.toDomain(projectDTO({ description: 'Full body' }))

            expect(project).toBeInstanceOf(Project)
            expect(project.description).toBe('Full body')
        })

        it('keeps every shared field in the right position (constructor argument order)', () => {
            const dto = projectDTO({ name: 'N', slug: 's', repoUrl: 'r', liveUrl: 'l', thumbnailUrl: 't' })
            const project = ProjectMapper.toDomain(dto)

            expect(project).toMatchObject({ name: 'N', slug: 's', repoUrl: 'r', liveUrl: 'l', thumbnailUrl: 't' })
        })
    })
})
