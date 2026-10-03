import { describe, expect, it } from 'vitest'
import { Job } from '@/src/domain/entities/Job'
import { jobDTO } from '@/src/test/fixtures'
import { JobMapper } from './JobMapper'

describe('JobMapper', () => {
    describe('toDomain', () => {
        it('maps a DTO to a Job entity', () => {
            const job = JobMapper.toDomain(jobDTO({ id: 5, companyName: 'Initech', role: 'Dev' }))

            expect(job).toBeInstanceOf(Job)
            expect(job).toMatchObject({ id: 5, companyName: 'Initech', role: 'Dev' })
        })

        it('keeps endedAt as null for a current job', () => {
            const job = JobMapper.toDomain(jobDTO({ endedAt: null, isEnded: false }))

            expect(job.endedAt).toBeNull()
            expect(job.isEnded).toBe(false)
        })

        it('converts both dates for a finished job', () => {
            const job = JobMapper.toDomain(
                jobDTO({ startedAt: '2020-01-01T00:00:00.000Z', endedAt: '2022-01-01T00:00:00.000Z', isEnded: true }),
            )

            expect(job.startedAt.toISOString()).toBe('2020-01-01T00:00:00.000Z')
            expect(job.endedAt?.toISOString()).toBe('2022-01-01T00:00:00.000Z')
        })
    })

    describe('toDTO', () => {
        it('round-trips a current job', () => {
            const dto = jobDTO()

            expect(JobMapper.toDTO(JobMapper.toDomain(dto))).toEqual(dto)
        })

        it('round-trips a finished job', () => {
            const dto = jobDTO({ endedAt: '2024-12-31T00:00:00.000Z', isEnded: true })

            expect(JobMapper.toDTO(JobMapper.toDomain(dto))).toEqual(dto)
        })
    })
})
