import { HttpApiClient } from '../../../../infrastructure/api/HttpApiClient'
import { ApiProjectRepository } from '../../../../infrastructure/repositories/ApiProjectRepository'
import type { ProjectDTO } from '../../../dtos/project/ProjectDTO'
import { GetPublishedProjectsQuery } from './GetPublishedProjectsQuery'

// =============================================================================
// loadProjects
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadProjects(): Promise<ProjectDTO[]> {
  const client = new HttpApiClient()
  const repo   = new ApiProjectRepository(client)
  const query  = new GetPublishedProjectsQuery(repo)
  return query.execute()
}