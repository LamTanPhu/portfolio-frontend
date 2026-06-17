// =============================================================================
// ContactDTO
// Request/response shapes for POST /contact.
// turnstileToken travels with the submission — the backend's TurnstileGuard
// verifies it inline as part of handling this same request. There is no
// separate verify-then-submit step, and no frontend-side verification logic:
// the secret-key check can only happen server-side, so none of it belongs here.
// =============================================================================

// Sent to POST /contact. Mirrors backend SubmitContactDto exactly.
export interface SubmitContactRequestDTO {
    name:           string
    email:          string
    message:        string
    turnstileToken: string
}

// Returned from POST /contact on success (HTTP 201).
export interface SubmitContactResponseDTO {
    success: boolean
    message: string
}