import type { ProjectSummaryDTO } from './ProjectSummaryDTO'

// =============================================================================
// ProjectDTO
// Returned from GET /projects/:slug — single-item queries only. Extends
// ProjectSummaryDTO with description, which the list endpoint omits.
//
// Previously this was the *only* project DTO and was also used (wrongly) to
// type the GET /projects list response — the type claimed description was
// always a string, but the backend's list endpoint never sends it. Split to
// match the backend's honest ProjectSummaryDTO/ProjectDTO distinction
// (see backend src/application/dtos/ProjectDTO.ts) — same fix already
// applied on the Blog side (BlogSummaryDTO/BlogDetailDTO).
// =============================================================================
export interface ProjectDTO extends ProjectSummaryDTO {
  description: string
}
