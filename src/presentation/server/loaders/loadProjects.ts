import { ApiProjectRepository } from '../../../infrastructure/repositories/ApiProjectRepository'
import { GetPublishedProjectsQuery } from '../../../application/use-cases/queries/project/GetPublishedProjectsQuery'
import type { ProjectDTO } from '../../../application/dtos/ProjectDTO'

// =============================================================================
// loadProjects
// Server-only loader — called from Server Components only.
// Never import this in client components.
// =============================================================================
export async function loadProjects(): Promise<ProjectDTO[]> {
  const repo  = new ApiProjectRepository()
  const query = new GetPublishedProjectsQuery(repo)
  return query.execute()
}
