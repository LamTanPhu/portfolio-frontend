import type { SkillDTO } from '../../application/dtos/skill/SkillDTO'
import type { SkillCategory } from '../../domain/entities/Skill'
import { Skill } from '../../domain/entities/Skill'
import { ValidationError } from '../../domain/errors/ValidationError'

// =============================================================================
// SkillMapper
// Converts between SkillDTO (API shape) and Skill domain entity.
// =============================================================================

const VALID_CATEGORIES: readonly SkillCategory[] = ['frontend', 'backend', 'devops', 'database', 'other']

function toSkillCategory(value: string): SkillCategory {
    if ((VALID_CATEGORIES as readonly string[]).includes(value)) {
        return value as SkillCategory
    }
    throw new ValidationError(
        `Unknown skill category "${value}" — expected one of: ${VALID_CATEGORIES.join(', ')}`,
    )
}

export class SkillMapper {
    static toDomain(dto: SkillDTO): Skill {
        return new Skill(
            dto.id,
            dto.name,
            dto.imageUrl,
            toSkillCategory(dto.category),
        )
    }

    static toDTO(skill: Skill): SkillDTO {
        return {
            id:       skill.id,
            name:     skill.name,
            imageUrl: skill.imageUrl,
            category: skill.category,
        }
    }
}