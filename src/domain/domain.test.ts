import { describe, expect, it } from 'vitest'
import { User } from './entities/User'
import { ContactSubmittedEvent } from './events/ContactSubmittedEvent'
import { DomainEvent } from './events/DomainEvent'

describe('User', () => {
    it('joins first and last name into fullName', () => {
        expect(new User(1, 'Phu', 'Lam', 'p@example.dev', null, null).fullName).toBe('Phu Lam')
    })
})

describe('domain events', () => {
    class Sample extends DomainEvent {}

    it('are stamped with the moment they were created by default', () => {
        const before = Date.now()
        const event = new Sample()

        expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before)
        expect(event.occurredAt.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('can be given an explicit timestamp (useful when replaying events)', () => {
        const when = new Date('2025-01-01T00:00:00Z')

        expect(new Sample(when).occurredAt).toBe(when)
    })

    it('ContactSubmittedEvent carries the submission and a timestamp', () => {
        const event = new ContactSubmittedEvent('Ada', 'ada@example.com', 'Hello')

        expect(event).toMatchObject({ name: 'Ada', email: 'ada@example.com', message: 'Hello' })
        expect(event.occurredAt).toBeInstanceOf(Date)
        expect(event).toBeInstanceOf(DomainEvent)
    })

    it('ContactSubmittedEvent accepts an explicit timestamp', () => {
        const when = new Date('2025-02-02T00:00:00Z')

        expect(new ContactSubmittedEvent('A', 'a@b.co', 'm', when).occurredAt).toBe(when)
    })
})
