import { ApiProjectRepository } from '../../../infrastructure/repositories/ApiProjectRepository'
import { GetPublishedProjectsQuery } from '../../../application/use-cases/queries/project/GetPublishedProjectsQuery'
import { ProjectDTO } from '../../../application/dtos/ProjectDTO'

export async function loadProjects(): Promise<ProjectDTO[]> {
  const repo = new ApiProjectRepository()
  const query = new GetPublishedProjectsQuery(repo)
  return query.execute()
}
