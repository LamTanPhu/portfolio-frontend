// =============================================================================
// IContactWriteRepository
// save — sends a contact message. Throws ValidationError, RateLimitedError,
// or ServerError on failure (see domain/errors) — never returns null/false
// for a failure, since "it didn't work" always has a specific reason here.
//
// Named to match the backend's IContactWriteRepository — that side also
// separates read/write per Interface Segregation Principle (admin message
// listing/deletion use IContactReadRepository there). The frontend's public
// contact form only ever needs to write, so there is no read counterpart
// here — add one only if a future use case actually needs to read messages.
//
// Takes a single named object rather than positional strings: four
// same-typed params in a row is an easy way to transpose name/email/message
// at a call site with no compiler error. A named object makes that mistake
// structurally harder to make.
// =============================================================================
export interface ContactSubmission {
    name:           string
    email:          string
    message:        string
    turnstileToken: string
}

export interface IContactWriteRepository {
    save(submission: ContactSubmission): Promise<void>
}