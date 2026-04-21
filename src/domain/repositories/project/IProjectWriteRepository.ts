import { Project } from '../../entities/Project'

export interface IProjectWriteRepository {
  create(data: Omit<Project, 'id'>): Promise<Project>
  update(id: number, data: Partial<Project>): Promise<Project>
  delete(id: number): Promise<void>
}
