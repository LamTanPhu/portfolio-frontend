import type { Project } from '../../entities/Project'
export interface IProjectReadRepository {
  findPublished(): Promise<Project[]>
  findBySlug(slug: string): Promise<Project | null>
}