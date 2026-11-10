import { createServerApiClient } from '../../../../infrastructure/api/createServerApiClient'
import { ApiProjectRepository } from '../../../../infrastructure/repositories/ApiProjectRepository'
import type { ProjectDTO } from '../../../dtos/project/ProjectDTO'
import { GetProjectBySlugQuery } from './GetProjectBySlugQuery'

// =============================================================================
// loadPublicProjectBySlug
// Server-only loader for the PUBLIC pages — same as loadProjectBySlug, but reads fall
// back to data/api-snapshot.json when the backend is down (see SNAPSHOT.md).
// Admin screens keep using loadProjectBySlug: they must show live data or an error.
// Composition root: wires infrastructure repository to application query.
// Returns null when no published project matches the slug (query already
// distinguishes 404 from real failures — see ApiProjectRepository).
// =============================================================================
export async function loadPublicProjectBySlug(slug: string): Promise<ProjectDTO | null> {
    const client = createServerApiClient()
    const repo   = new ApiProjectRepository(client)
    const query  = new GetProjectBySlugQuery(repo)
    return query.execute(slug)
}