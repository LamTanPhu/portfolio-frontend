// =============================================================================
// ITurnstileVerifier
// Application port for Cloudflare Turnstile token verification.
// =============================================================================
export interface ITurnstileVerifier {
  verifyToken(token: string): Promise<boolean>
}
