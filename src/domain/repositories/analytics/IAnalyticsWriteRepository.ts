// =============================================================================
// IAnalyticsWriteRepository
// trackPageView    — records a route visit
// trackProjectView — records a project detail page visit
//
// Fire-and-forget by contract: implementations should never let a tracking
// failure surface to the visitor. See ApiAnalyticsRepository.
// =============================================================================
export interface IAnalyticsWriteRepository {
    trackPageView(route: string): Promise<void>
    trackProjectView(projectId: number): Promise<void>
}