import { describe, expect, it } from 'vitest'
import { Education } from '@/src/domain/entities/Education'
import { educationDTO } from '@/src/test/fixtures'
import { EducationMapper } from './EducationMapper'

describe('EducationMapper', () => {
    describe('toDomain', () => {
        it('maps a DTO to an Education entity with real Date objects', () => {
            const edu = EducationMapper.toDomain(educationDTO())

            expect(edu).toBeInstanceOf(Education)
            expect(edu.startedAt).toBeInstanceOf(Date)
            expect(edu.endedAt).toBeInstanceOf(Date)
            expect(edu.isCompleted).toBe(true)
        })

        it('keeps endedAt as null for a degree still in progress', () => {
            const edu = EducationMapper.toDomain(educationDTO({ endedAt: null, isCompleted: false }))

            expect(edu.endedAt).toBeNull()
            expect(edu.isCompleted).toBe(false)
        })

        it('keeps a null instituteUrl as null', () => {
            expect(EducationMapper.toDomain(educationDTO({ instituteUrl: null })).instituteUrl).toBeNull()
        })
    })

    describe('toDTO', () => {
        it('round-trips a completed degree', () => {
            const dto = educationDTO()

            expect(EducationMapper.toDTO(EducationMapper.toDomain(dto))).toEqual(dto)
        })

        it('round-trips an in-progress degree (endedAt: null)', () => {
            const dto = educationDTO({ endedAt: null, isCompleted: false })

            expect(EducationMapper.toDTO(EducationMapper.toDomain(dto))).toEqual(dto)
        })
    })
})
