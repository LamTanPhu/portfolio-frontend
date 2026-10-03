import { describe, expect, it } from 'vitest'
import { ValidationError } from '../errors/ValidationError'
import { Slug } from './Slug'

describe('Slug', () => {
    it.each([
        ['Hello World', 'hello-world'],
        ['  Padded   Title  ', 'padded-title'],
        ['Hello, World!', 'hello-world'],
        ['already-a-slug', 'already-a-slug'],
        ['Multiple   spaces   here', 'multiple-spaces-here'],
        ['dashes---everywhere', 'dashes-everywhere'],
        ['-leading and trailing-', 'leading-and-trailing'],
        ['Next.js 16 & React 19', 'nextjs-16-react-19'],
    ])('turns "%s" into "%s"', (input, expected) => {
        expect(new Slug(input).toString()).toBe(expected)
    })

    it('Slug.from is the same as the constructor', () => {
        expect(Slug.from('Some Title').toString()).toBe(new Slug('Some Title').toString())
    })

    it.each(['', '   ', '!!!', '---', '🎉'])('throws a ValidationError when nothing usable is left ("%s")', (input) => {
        expect(() => new Slug(input)).toThrow(ValidationError)
    })

    it('names the original input in the error message', () => {
        expect(() => new Slug('!!!')).toThrow(/!!!/)
    })

    // Characterisation test: non-ASCII letters are dropped, not transliterated.
    // Worth knowing for Vietnamese titles: "Lâm Tấn Phú" loses its accented letters.
    it('drops accented letters instead of transliterating them', () => {
        expect(new Slug('Lâm Tấn Phú').toString()).toBe('lm-tn-ph')
    })
})
