import { describe, expect, it } from 'vitest'
import { ValidationError } from '../errors/ValidationError'
import { Email } from './Email'

describe('Email', () => {
    it('accepts a normal address', () => {
        expect(new Email('ada@example.com').toString()).toBe('ada@example.com')
    })

    it('lower-cases the stored value', () => {
        expect(new Email('Ada@Example.COM').toString()).toBe('ada@example.com')
    })

    it.each(['plainaddress', 'no-at.example.com', '@example.com', 'ada@', 'ada@example', 'ada@@example.com', 'a b@example.com', ''])(
        'rejects "%s"',
        (bad) => {
            expect(() => new Email(bad)).toThrow(ValidationError)
        },
    )

    it('includes the offending input in the error message', () => {
        expect(() => new Email('nope')).toThrow(/nope/)
    })

    it('isValid mirrors the constructor without throwing', () => {
        expect(Email.isValid('ada@example.com')).toBe(true)
        expect(Email.isValid('ada')).toBe(false)
    })

    // Characterisation: validation runs on the raw input before trimming, so
    // padded input is rejected rather than cleaned up.
    it('rejects an address with surrounding whitespace instead of trimming it', () => {
        expect(Email.isValid(' ada@example.com ')).toBe(false)
        expect(() => new Email(' ada@example.com ')).toThrow(ValidationError)
    })
})
