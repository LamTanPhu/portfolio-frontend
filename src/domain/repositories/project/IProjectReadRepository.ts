import type { Project, ProjectSummary } from '../../entities/Project'
export interface IProjectReadRepository {
  findPublished(): Promise<ProjectSummary[]>
  findBySlug(slug: string): Promise<Project | null>
}
