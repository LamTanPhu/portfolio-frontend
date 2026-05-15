import type { ITurnstileVerifier } from '../../application/ports/ITurnstileVerifier'

// =============================================================================
// TurnstileVerifier
// Client-side Turnstile token submission to backend for verification.
// Actual verification happens server-side — this just passes the token.
// =============================================================================
export class TurnstileVerifier implements ITurnstileVerifier {
  async verifyToken(token: string): Promise<boolean> {
    const res = await fetch('/api/verify-turnstile', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
    })
    const data = await res.json() as { success: boolean }
    return data.success
  }
}
