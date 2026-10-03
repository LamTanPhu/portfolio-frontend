import { describe, expect, it } from 'vitest'
import { Certification } from '@/src/domain/entities/Certification'
import { certificationDTO } from '@/src/test/fixtures'
import { CertificationMapper } from './CertificationMapper'

describe('CertificationMapper', () => {
    describe('toDomain', () => {
        it('maps a DTO to a Certification entity with real Date objects', () => {
            const cert = CertificationMapper.toDomain(
                certificationDTO({ startDate: '2024-05-01T00:00:00.000Z', endDate: '2027-05-01T00:00:00.000Z' }),
            )

            expect(cert).toBeInstanceOf(Certification)
            expect(cert.startDate.toISOString()).toBe('2024-05-01T00:00:00.000Z')
            expect(cert.endDate?.toISOString()).toBe('2027-05-01T00:00:00.000Z')
        })

        it('keeps endDate as null for a certification that does not expire', () => {
            expect(CertificationMapper.toDomain(certificationDTO({ endDate: null })).endDate).toBeNull()
        })
    })

    describe('toDTO', () => {
        it('serialises dates back to ISO strings', () => {
            const dto = certificationDTO()

            expect(CertificationMapper.toDTO(CertificationMapper.toDomain(dto))).toEqual(dto)
        })

        it('serialises a missing endDate as null, not undefined', () => {
            const dto = CertificationMapper.toDTO(CertificationMapper.toDomain(certificationDTO({ endDate: null })))

            expect(dto.endDate).toBeNull()
        })
    })
})
