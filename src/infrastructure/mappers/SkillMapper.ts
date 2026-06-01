import { Skill } from '../../domain/entities/Skill'
import type { SkillDTO } from '../../application/dtos/SkillDTO'
import type { SkillCategory } from '../../domain/entities/Skill'

// =============================================================================
// SkillMapper
// Converts between SkillDTO (API shape) and Skill domain entity.
// =============================================================================
export class SkillMapper {
    static toDomain(dto: SkillDTO): Skill {
        return new Skill(
            dto.id,
            dto.name,
            dto.imageUrl,
            dto.category as SkillCategory,
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