import { describe, expect, it } from 'vitest'
import { SocialAccount } from '@/src/domain/entities/SocialAccount'
import { socialAccountDTO } from '@/src/test/fixtures'
import { SocialAccountMapper } from './SocialAccountMapper'

describe('SocialAccountMapper', () => {
    it('maps a DTO to a SocialAccount entity', () => {
        const account = SocialAccountMapper.toDomain(socialAccountDTO({ id: 3, name: 'X', url: 'https://x.com/me', imageUrl: 'i.png' }))

        expect(account).toBeInstanceOf(SocialAccount)
        expect(account).toMatchObject({ id: 3, name: 'X', url: 'https://x.com/me', imageUrl: 'i.png' })
    })

    it('keeps a null imageUrl as null', () => {
        expect(SocialAccountMapper.toDomain(socialAccountDTO({ imageUrl: null })).imageUrl).toBeNull()
    })

    it('toDTO round-trips the entity fields', () => {
        const dto = socialAccountDTO({ imageUrl: 'i.png' })

        expect(SocialAccountMapper.toDTO(SocialAccountMapper.toDomain(dto))).toEqual(dto)
    })

    // Documents current behaviour: the entity has no visibility field, so toDTO
    // always emits isPublic: true. If that ever changes this test should too.
    it('toDTO always emits isPublic: true, because the entity does not carry visibility', () => {
        const dto = SocialAccountMapper.toDTO(SocialAccountMapper.toDomain(socialAccountDTO({ isPublic: false })))

        expect(dto.isPublic).toBe(true)
    })
})
