import { describe, expect, it } from 'vitest'
import { Skill } from '@/src/domain/entities/Skill'
import { ValidationError } from '@/src/domain/errors/ValidationError'
import { skillDTO } from '@/src/test/fixtures'
import { SkillMapper } from './SkillMapper'

describe('SkillMapper', () => {
    describe('toDomain', () => {
        it('maps a DTO to a Skill entity', () => {
            const skill = SkillMapper.toDomain(skillDTO({ id: 4, name: 'Rust', imageUrl: null, category: 'backend' }))

            expect(skill).toBeInstanceOf(Skill)
            expect(skill).toMatchObject({ id: 4, name: 'Rust', imageUrl: null, category: 'backend' })
        })

        it.each(['frontend', 'backend', 'devops', 'database', 'other'])('accepts the "%s" category', (category) => {
            expect(SkillMapper.toDomain(skillDTO({ category })).category).toBe(category)
        })

        it('throws a ValidationError for an unknown category, naming the bad value and the allowed ones', () => {
            const act = () => SkillMapper.toDomain(skillDTO({ category: 'quantum' }))

            expect(act).toThrow(ValidationError)
            expect(act).toThrow(/quantum/)
            expect(act).toThrow(/frontend, backend, devops, database, other/)
        })

        it('is case-sensitive: "Frontend" is not a valid category', () => {
            expect(() => SkillMapper.toDomain(skillDTO({ category: 'Frontend' }))).toThrow(ValidationError)
        })

        it('rejects an empty category', () => {
            expect(() => SkillMapper.toDomain(skillDTO({ category: '' }))).toThrow(ValidationError)
        })
    })

    describe('toDTO', () => {
        it('round-trips: toDTO(toDomain(dto)) equals the original DTO', () => {
            const dto = skillDTO({ id: 9, name: 'Postgres', imageUrl: null, category: 'database' })

            expect(SkillMapper.toDTO(SkillMapper.toDomain(dto))).toEqual(dto)
        })
    })
})
