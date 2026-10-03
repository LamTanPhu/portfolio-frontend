import { describe, expect, it } from 'vitest'
import { User } from '@/src/domain/entities/User'
import { userProfileDTO } from '@/src/test/fixtures'
import { UserMapper } from './UserMapper'

describe('UserMapper', () => {
    it('maps a profile DTO to a User entity', () => {
        const user = UserMapper.toDomain(userProfileDTO({ id: 2, firstname: 'A', lastname: 'B', email: 'a@b.co', aboutme: 'Hi' }))

        expect(user).toBeInstanceOf(User)
        expect(user).toMatchObject({ id: 2, firstname: 'A', lastname: 'B', email: 'a@b.co', aboutme: 'Hi' })
    })

    it('converts lastLogin to a Date', () => {
        const user = UserMapper.toDomain(userProfileDTO({ lastLogin: '2025-04-01T12:00:00.000Z' }))

        expect(user.lastLogin).toBeInstanceOf(Date)
        expect(user.lastLogin?.toISOString()).toBe('2025-04-01T12:00:00.000Z')
    })

    it('keeps lastLogin as null for an admin who never logged in', () => {
        expect(UserMapper.toDomain(userProfileDTO({ lastLogin: null })).lastLogin).toBeNull()
    })

    it('keeps a null aboutme as null', () => {
        expect(UserMapper.toDomain(userProfileDTO({ aboutme: null })).aboutme).toBeNull()
    })
})
