import { Education } from '../../domain/entities/Education'
import type { EducationDTO } from '../../application/dtos/EducationDTO'

// =============================================================================
// EducationMapper
// Converts between EducationDTO (API shape) and Education domain entity.
// =============================================================================
export class EducationMapper {
    static toDomain(dto: EducationDTO): Education {
        return new Education(
            dto.id,
            dto.degreeName,
            dto.instituteName,
            dto.instituteUrl,
            new Date(dto.startedAt),
            dto.endedAt ? new Date(dto.endedAt) : null,
            dto.isCompleted,
        )
    }

    static toDTO(education: Education): EducationDTO {
        return {
            id:            education.id,
            degreeName:    education.degreeName,
            instituteName: education.instituteName,
            instituteUrl:  education.instituteUrl,
            startedAt:     education.startedAt.toISOString(),
            endedAt:       education.endedAt?.toISOString() ?? null,
            isCompleted:   education.isCompleted,
        }
    }
}