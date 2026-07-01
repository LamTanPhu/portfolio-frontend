'use server'

import { SubmitContactCommand, type SubmitContactInput } from '@/src/application/use-cases/commands/contact/SubmitContactCommand'
import { ValidationError }   from '@/src/domain/errors/ValidationError'
import { RateLimitedError }  from '@/src/domain/errors/RateLimitedError'
import { ServerError }       from '@/src/domain/errors/ServerError'

// =============================================================================
// submitContactAction
// Server Action — the only place allowed to call SubmitContactCommand.execute()
// (the command's own docs are explicit that it's server-only, called from a
// Server Action, never from a Server Component's render path).
//
// Why this returns a result object instead of throwing:
// Next.js strips error messages from anything thrown out of a Server Action
// in production (by design — it won't leak server internals to the client).
// That's fine for genuine bugs, but ValidationError / RateLimitedError /
// ServerError carry messages the user is *meant* to see. So instead of
// throwing, we catch here and hand back a plain, serializable discriminated
// result — the client component switches on `success` and reads `error`
// directly, no message-stripping involved.
// =============================================================================
export type SubmitContactResult =
    | { success: true }
    | { success: false; error: string }

export async function submitContactAction(
    input: SubmitContactInput,
): Promise<SubmitContactResult> {
    try {
        await SubmitContactCommand.create().execute(input)
        return { success: true }
    } catch (err) {
        if (err instanceof ValidationError)  return { success: false, error: err.message }
        if (err instanceof RateLimitedError) return { success: false, error: err.message }
        if (err instanceof ServerError)      return { success: false, error: err.message }

        // Anything else is unexpected — don't leak it, but don't pretend it
        // was a validation problem either.
        return { success: false, error: 'Something went wrong. Please try again later.' }
    }
}