import type { User } from '../../entities/User'

// =============================================================================
// IUserReadRepository
// Admin-only — the portfolio has a single admin, resolved from the access
// token rather than passed as an id.
// =============================================================================
export interface IUserReadRepository {
    getProfile(accessToken: string): Promise<User>
}
