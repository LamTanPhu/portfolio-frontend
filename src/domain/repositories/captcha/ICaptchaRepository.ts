// =============================================================================
// ICaptchaRepository
// The in-house "snake game" anti-bot check that runs alongside (never
// instead of) Turnstile on the contact form — see SnakeCaptchaGate.
//
// issueSnakeChallenge — requests a fresh, single-use challenge id, to be
//   echoed back on completion. Throws RateLimitedError/ServerError; there's
//   no "expected failure" case for issuing a challenge.
// verifySnakeCompletion — reports a completed playthrough. Returns a signed
//   proof token on success, or null on an ordinary/expected failure
//   (unknown or already-used challenge, incomplete game, implausible
//   timing) — this is a normal outcome, not an exceptional one, same
//   reasoning as why a wrong password doesn't throw. Still throws
//   RateLimitedError/ServerError for genuinely exceptional failures.
// =============================================================================
export interface SnakeCompletionReport {
    challengeId: string
    eaten:       number
    durationMs:  number
    moveCount:   number
}

export interface ICaptchaRepository {
    issueSnakeChallenge(): Promise<string>
    verifySnakeCompletion(report: SnakeCompletionReport): Promise<string | null>
}
