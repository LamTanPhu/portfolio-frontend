'use client'
import { useEffect, useRef, useState } from 'react'
import { SnakeGame } from './SnakeGame'
import type { SnakeWinResult } from './SnakeGame'
import { IssueSnakeChallengeQuery } from '@/src/application/use-cases/queries/captcha/IssueSnakeChallengeQuery'
import { VerifySnakeCompletionCommand } from '@/src/application/use-cases/commands/captcha/VerifySnakeCompletionCommand'
import { RateLimitedError } from '@/src/domain/errors/RateLimitedError'
import { ServerError } from '@/src/domain/errors/ServerError'

// =============================================================================
// SnakeCaptchaGate — Organism
// Wraps SnakeGame with the challenge/verify protocol, and is the only place
// that does — the game itself (and its decorative homepage instance) knows
// nothing about challenges or proof tokens, just plays and reports a win.
//
// No onSkip is ever passed to SnakeGame here — that's the whole point.
//
// A fresh challenge is requested once on mount, and again after any
// non-success verify outcome (ordinary failure or a thrown error) so the
// visitor can just hit the game's own "start-again" button and try once
// more without this component needing to orchestrate a reset itself.
// =============================================================================

interface Props {
    onVerified: (proofToken: string) => void
}

export function SnakeCaptchaGate({ onVerified }: Props) {
    const [challengeId, setChallengeId] = useState<string | null>(null)
    const [loadError,   setLoadError]   = useState<string | null>(null)
    const [verifying,   setVerifying]   = useState(false)
    const [verifyError, setVerifyError] = useState<string | null>(null)

    // Guards against issuing a second challenge if this effect somehow ran
    // twice (React Strict Mode double-invokes effects in development).
    const issuedRef = useRef(false)

    async function fetchChallenge() {
        try {
            const id = await IssueSnakeChallengeQuery.create().execute()
            setChallengeId(id)
            setLoadError(null)
        } catch (err) {
            setLoadError(
                err instanceof RateLimitedError || err instanceof ServerError
                    ? err.message
                    : 'Could not start the verification game. Please try again later.',
            )
        }
    }

    useEffect(() => {
        if (issuedRef.current) return
        issuedRef.current = true
        void fetchChallenge()
    }, [])

    async function handleWin(result: SnakeWinResult) {
        if (!challengeId) return

        setVerifying(true)
        setVerifyError(null)

        try {
            const proofToken = await VerifySnakeCompletionCommand.create().execute({
                challengeId,
                ...result,
            })

            if (proofToken) {
                onVerified(proofToken)
                return // gate unmounts shortly — nothing left to reset below
            }

            setVerifying(false)
            setVerifyError("That run didn't check out — have another go.")
            // The challenge just used is consumed either way — get a fresh
            // one ready before the visitor can hit "start-again".
            void fetchChallenge()
        } catch (err) {
            setVerifying(false)
            setVerifyError(
                err instanceof RateLimitedError || err instanceof ServerError
                    ? err.message
                    : 'Could not verify — please try again.',
            )
            void fetchChallenge()
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 py-6">
            <div className="text-center max-w-sm">
                <p className="font-mono text-xs text-(--text-comment)">{'// one more check before you can reach me'}</p>
                <h2 className="font-mono text-sm text-(--text-primary) mt-1">
                    Beat the snake game to unlock the form
                </h2>
                <p className="font-mono text-[11px] text-(--text-muted) mt-1">
                    Eat all 10 dots. Yes, this is also me showing off that I built this game myself.
                </p>
            </div>

            {loadError ? (
                <div className="flex flex-col items-center gap-3 p-6 border border-(--border-muted) rounded-xl">
                    <p className="font-mono text-xs text-red-500 text-center">{loadError}</p>
                    <button
                        onClick={() => { void fetchChallenge() }}
                        className="font-mono text-xs px-4 py-2 rounded-lg text-(--text-muted) border border-(--border-muted) hover:text-(--text-primary) hover:border-(--accent-teal) transition-colors duration-150"
                    >
                        try again
                    </button>
                </div>
            ) : challengeId === null ? (
                <p className="font-mono text-xs text-(--text-muted)">{'// loading...'}</p>
            ) : (
                <SnakeGame onWin={(result) => { void handleWin(result) }} />
            )}

            {verifying && (
                <p className="font-mono text-xs text-(--text-muted)">{'// verifying...'}</p>
            )}
            {verifyError && !verifying && (
                <p className="font-mono text-xs text-(--accent-amber)">{verifyError}</p>
            )}
        </div>
    )
}
