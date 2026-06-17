// =============================================================================
// IContactRepository
// submit — sends a contact message. Throws ValidationError, RateLimitedError,
// or ServerError on failure (see domain/errors) — never returns null/false
// for a failure, since "it didn't work" always has a specific reason here.
// =============================================================================
export interface IContactRepository {
    submit(name: string, email: string, message: string, turnstileToken: string): Promise<void>
}