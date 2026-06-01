import { ApiProjectRepository }      from '../../../../infrastructure/repositories/ApiProjectRepository'
import { GetPublishedProjectsQuery }  from './GetPublishedProjectsQuery'
import type { ProjectDTO }            from '../../../dtos/ProjectDTO'

// =============================================================================
// loadProjects
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadProjects(): Promise<ProjectDTO[]> {
  const repo  = new ApiProjectRepository()
  const query = new GetPublishedProjectsQuery(repo)
  return query.execute()
}