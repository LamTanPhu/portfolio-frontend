// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/lib/constants'
import { server } from '@/src/test/msw/server'
import { SnakeCaptchaGate } from './SnakeCaptchaGate'

// The game itself is canvas/keyboard driven and has nothing to do with the
// challenge protocol, so it's replaced by a button that "wins" on click.
vi.mock('./SnakeGame', () => ({
    SnakeGame: ({ onWin }: { onWin?: (r: { eaten: number; durationMs: number; moveCount: number }) => void }) => (
        <button onClick={() => onWin?.({ eaten: 10, durationMs: 15_000, moveCount: 120 })}>win the game</button>
    ),
}))

const CHALLENGE = `${API_URL}/captcha/snake/challenge`
const VERIFY = `${API_URL}/captcha/snake/verify`

const challengeOk = (id = 'c-1') => http.post(CHALLENGE, () => HttpResponse.json({ challengeId: id }))

describe('SnakeCaptchaGate', () => {
    it('shows a loading state, then the game once a challenge has been issued', async () => {
        server.use(challengeOk())

        render(<SnakeCaptchaGate onVerified={vi.fn()} />)

        expect(screen.getByText('// loading...')).toBeInTheDocument()
        expect(await screen.findByRole('button', { name: 'win the game' })).toBeInTheDocument()
    })

    it('requests exactly one challenge on mount', async () => {
        const spy = vi.fn()
        server.use(http.post(CHALLENGE, () => { spy(); return HttpResponse.json({ challengeId: 'c-1' }) }))

        render(<SnakeCaptchaGate onVerified={vi.fn()} />)
        await screen.findByRole('button', { name: 'win the game' })

        expect(spy).toHaveBeenCalledTimes(1)
    })

    it('sends the challenge id and the game result when the player wins, then reports the proof token', async () => {
        let verifyBody: unknown
        server.use(
            challengeOk('c-42'),
            http.post(VERIFY, async ({ request }) => { verifyBody = await request.json(); return HttpResponse.json({ proofToken: 'proof-1' }) }),
        )
        const onVerified = vi.fn()
        render(<SnakeCaptchaGate onVerified={onVerified} />)

        await userEvent.click(await screen.findByRole('button', { name: 'win the game' }))

        await waitFor(() => expect(onVerified).toHaveBeenCalledWith('proof-1'))
        expect(verifyBody).toEqual({ challengeId: 'c-42', eaten: 10, durationMs: 15_000, moveCount: 120 })
    })

    it('shows a retry message and fetches a fresh challenge when verification is rejected (400)', async () => {
        const issued = vi.fn()
        server.use(
            http.post(CHALLENGE, () => { issued(); return HttpResponse.json({ challengeId: `c-${issued.mock.calls.length}` }) }),
            http.post(VERIFY, () => HttpResponse.json({ message: 'nope' }, { status: 400 })),
        )
        const onVerified = vi.fn()
        render(<SnakeCaptchaGate onVerified={onVerified} />)

        await userEvent.click(await screen.findByRole('button', { name: 'win the game' }))

        expect(await screen.findByText(/didn't check out/i)).toBeInTheDocument()
        expect(onVerified).not.toHaveBeenCalled()
        await waitFor(() => expect(issued).toHaveBeenCalledTimes(2)) // consumed challenge replaced
    })

    it('surfaces the rate-limit message when verification is throttled (429)', async () => {
        server.use(challengeOk(), http.post(VERIFY, () => new HttpResponse(null, { status: 429 })))
        render(<SnakeCaptchaGate onVerified={vi.fn()} />)

        await userEvent.click(await screen.findByRole('button', { name: 'win the game' }))

        expect(await screen.findByText(/too many attempts/i)).toBeInTheDocument()
    })

    it('shows a generic error when verification fails on the server (500)', async () => {
        server.use(challengeOk(), http.post(VERIFY, () => new HttpResponse(null, { status: 500 })))
        render(<SnakeCaptchaGate onVerified={vi.fn()} />)

        await userEvent.click(await screen.findByRole('button', { name: 'win the game' }))

        expect(await screen.findByText(/could not verify/i)).toBeInTheDocument()
    })

    it('shows the rate-limit message and a retry button when the challenge itself is throttled', async () => {
        server.use(http.post(CHALLENGE, () => new HttpResponse(null, { status: 429 })))

        render(<SnakeCaptchaGate onVerified={vi.fn()} />)

        expect(await screen.findByText(/too many attempts/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'try again' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'win the game' })).not.toBeInTheDocument()
    })

    it('recovers via "try again" once the backend is available', async () => {
        let calls = 0
        server.use(http.post(CHALLENGE, () => (++calls === 1 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json({ challengeId: 'c-2' }))))
        render(<SnakeCaptchaGate onVerified={vi.fn()} />)

        await userEvent.click(await screen.findByRole('button', { name: 'try again' }))

        expect(await screen.findByRole('button', { name: 'win the game' })).toBeInTheDocument()
    })
})
