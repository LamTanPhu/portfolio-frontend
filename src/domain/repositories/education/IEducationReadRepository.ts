import type { Education } from '../../entities/Education'

export interface IEducationReadRepository {
    findAll(): Promise<Education[]>
}