import { IProjectReadRepository } from '../../domain/repositories/project/IProjectReadRepository'
import { Project } from '../../domain/entities/Project'
import { ProjectMapper, RawProject } from '../mappers/ProjectMapper'
import { get } from '../api/httpClient'

export class ApiProjectRepository implements IProjectReadRepository {
  async findAll(): Promise<Project[]> {
    const raw = await get<RawProject[]>('/projects')
    return raw.map(ProjectMapper.toDomain)
  }
  async findPublished(): Promise<Project[]> {
    const raw = await get<RawProject[]>('/projects?published=true')
    return raw.map(ProjectMapper.toDomain)
  }
  async findById(id: number): Promise<Project | null> {
    try { return ProjectMapper.toDomain(await get<RawProject>(/projects/)) }
    catch { return null }
  }
  async findBySlug(slug: string): Promise<Project | null> {
    try { return ProjectMapper.toDomain(await get<RawProject>(/projects/slug/)) }
    catch { return null }
  }
}
