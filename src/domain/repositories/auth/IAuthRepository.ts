// =============================================================================
// IAuthRepository
// Single-admin auth — no user identity beyond "the admin" (backend resolves
// that from ADMIN_EMAIL env, not from anything the client sends).
//
// login/refresh return a fresh access token; the refresh token itself never
// reaches this layer — it lives in an httpOnly cookie the browser manages
// automatically (see ApiAuthRepository for the credentials contract).
// =============================================================================
export interface AuthResult {
    accessToken: string
}

export interface IAuthRepository {
    login(password: string): Promise<AuthResult>
    refresh(): Promise<AuthResult>
    logout(accessToken: string): Promise<void>
}