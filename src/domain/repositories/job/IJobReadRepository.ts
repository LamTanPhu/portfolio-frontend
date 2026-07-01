import type { Job } from '../../entities/Job'

export interface IJobReadRepository {
    findAll(): Promise<Job[]>
}