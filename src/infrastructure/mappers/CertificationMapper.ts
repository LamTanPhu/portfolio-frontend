import { Certification } from '../../domain/entities/Certification'
import type { CertificationDTO } from '../../application/dtos/CertificationDTO'

// =============================================================================
// CertificationMapper
// Converts between CertificationDTO (API shape) and Certification domain entity.
// =============================================================================
export class CertificationMapper {
    static toDomain(dto: CertificationDTO): Certification {
        return new Certification(
            dto.id,
            dto.name,
            dto.url,
            new Date(dto.startDate),
            dto.endDate ? new Date(dto.endDate) : null,
        )
    }

    static toDTO(certification: Certification): CertificationDTO {
        return {
            id:        certification.id,
            name:      certification.name,
            url:       certification.url,
            startDate: certification.startDate.toISOString(),
            endDate:   certification.endDate?.toISOString() ?? null,
        }
    }
}