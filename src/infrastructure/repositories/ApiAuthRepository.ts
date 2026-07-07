import type { IAuthRepository, AuthResult } from '../../domain/repositories/auth/IAuthRepository'
import type { IApiClient } from '../../application/ports/IApiClient'

// =============================================================================
// ApiAuthRepository
// login   — POST /auth/login    { password } → { accessToken }, sets httpOnly refresh cookie
// refresh — POST /auth/refresh  (cookie only) → { accessToken }, rotates the cookie
// logout  — POST /auth/logout   (Bearer token) → 204, clears the cookie
//
// login/refresh need withCredentials so the browser sends/stores the
// httpOnly refresh cookie. logout needs both — it's behind JwtAuthGuard
// (needs the bearer token) AND clears the cookie server-side (needs the
// cookie sent so the backend can revoke the right session).
// =============================================================================
export class ApiAuthRepository implements IAuthRepository {
    constructor(private readonly client: IApiClient) {}

    async login(password: string): Promise<AuthResult> {
        return this.client.post<AuthResult>('/auth/login', { password }, { withCredentials: true })
    }

    async refresh(): Promise<AuthResult> {
        return this.client.post<AuthResult>('/auth/refresh', {}, { withCredentials: true })
    }

    async logout(accessToken: string): Promise<void> {
        await this.client.post<void>('/auth/logout', {}, { withCredentials: true, accessToken })
    }
}