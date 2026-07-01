import { HttpApiClient }         from '../../../../infrastructure/api/HttpApiClient'
import { ApiProjectRepository }  from '../../../../infrastructure/repositories/ApiProjectRepository'
import { GetProjectBySlugQuery } from './GetProjectBySlugQuery'
import type { ProjectDTO }       from '../../../dtos/ProjectDTO'

// =============================================================================
// loadProjectBySlug
// Server-only loader — called from Server Components only.
// Composition root: wires infrastructure repository to application query.
// Returns null when no published project matches the slug (query already
// distinguishes 404 from real failures — see ApiProjectRepository).
// =============================================================================
export async function loadProjectBySlug(slug: string): Promise<ProjectDTO | null> {
    const client = new HttpApiClient()
    const repo   = new ApiProjectRepository(client)
    const query  = new GetProjectBySlugQuery(repo)
    return query.execute(slug)
}