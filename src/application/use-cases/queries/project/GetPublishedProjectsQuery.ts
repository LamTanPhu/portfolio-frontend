import { IProjectReadRepository } from '../../../../domain/repositories/project/IProjectReadRepository'
import { ProjectDTO } from '../.././../dtos/ProjectDTO'

export class GetPublishedProjectsQuery {
  constructor(private readonly repo: IProjectReadRepository) {}

  async execute(): Promise<ProjectDTO[]> {
    const projects = await this.repo.findPublished()
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      slug: p.slug,
      techStack: p.techStack,
      isOpenSource: p.isOpenSource,
      createdAt: p.createdAt.toISOString(),
    }))
  }
}
