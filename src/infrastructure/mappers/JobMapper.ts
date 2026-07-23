import type { JobDTO } from '../../application/dtos/job/JobDTO'
import { Job } from '../../domain/entities/Job'

// =============================================================================
// JobMapper
// Converts between JobDTO (API shape) and Job domain entity.
// =============================================================================
export class JobMapper {
    static toDomain(dto: JobDTO): Job {
        return new Job(
            dto.id,
            dto.companyName,
            dto.role,
            new Date(dto.startedAt),
            dto.endedAt ? new Date(dto.endedAt) : null,
            dto.isEnded,
        )
    }

    static toDTO(job: Job): JobDTO {
        return {
            id:          job.id,
            companyName: job.companyName,
            role:        job.role,
            startedAt:   job.startedAt.toISOString(),
            endedAt:     job.endedAt?.toISOString() ?? null,
            isEnded:     job.isEnded,
        }
    }
}