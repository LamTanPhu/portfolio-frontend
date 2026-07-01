import type { Certification } from '../../entities/Certification'

export interface ICertificationReadRepository {
    findAll(): Promise<Certification[]>
}