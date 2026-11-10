import { createServerApiClient } from '../../../../infrastructure/api/createServerApiClient'
import { ApiProjectRepository } from '../../../../infrastructure/repositories/ApiProjectRepository'
import type { ProjectSummaryDTO } from '../../../dtos/project/ProjectSummaryDTO'
import { GetPublishedProjectsQuery } from './GetPublishedProjectsQuery'

// =============================================================================
// loadPublicProjects
// Server-only loader for the PUBLIC pages — same as loadProjects, but reads fall
// back to data/api-snapshot.json when the backend is down (see SNAPSHOT.md).
// Admin screens keep using loadProjects: they must show live data or an error.
// Composition root: wires infrastructure repository to application query.
// =============================================================================
export async function loadPublicProjects(): Promise<ProjectSummaryDTO[]> {
  const client = createServerApiClient()
  const repo   = new ApiProjectRepository(client)
  const query  = new GetPublishedProjectsQuery(repo)
  return query.execute()
}
