// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SidebarItem } from '../organisms/Sidebar'
import { socialAccountDTO } from '@/src/test/fixtures'
import { ContactPage } from './ContactPage'

const submitContactAction = vi.hoisted(() => vi.fn())
vi.mock('@/app/contact/action', () => ({ submitContactAction }))

// Page chrome (tabs, status bar, Spotify widget...) is covered elsewhere. The
// stand-in keeps the sidebar items visible because ContactPage builds them.
vi.mock('../templates/VSCodeLayout', () => ({
    VSCodeLayout: ({ children, sidebarItems = [] }: { children: ReactNode; sidebarItems?: SidebarItem[] }) => (
        <div>
            <nav aria-label="sidebar">
                {sidebarItems.map((group) => (
                    <section key={group.label} aria-label={group.label}>
                        {group.children?.map((c) => <a key={c.href} href={c.href}>{c.label}</a>)}
                    </section>
                ))}
            </nav>
            {children}
        </div>
    ),
}))

vi.mock('../organisms/SnakeCaptchaGate', () => ({
    SnakeCaptchaGate: ({ onVerified }: { onVerified: (t: string) => void }) => (
        <button onClick={() => onVerified('snake-token')}>pass the snake gate</button>
    ),
}))

vi.mock('@marsidev/react-turnstile', () => ({
    Turnstile: ({ onSuccess, onExpire }: { onSuccess: (t: string) => void; onExpire: () => void }) => (
        <div>
            <button onClick={() => onSuccess('ts-token')}>complete turnstile</button>
            <button onClick={onExpire}>expire turnstile</button>
        </div>
    ),
}))

// The form's labels aren't associated with their inputs (no htmlFor), so
// fields are located by the order they appear: name, email, message.
function fields() {
    const [name, email] = screen.getAllByRole('textbox').filter((el) => el.tagName === 'INPUT') as HTMLInputElement[]
    const message = screen.getAllByRole('textbox').find((el) => el.tagName === 'TEXTAREA') as HTMLTextAreaElement
    return { name, email, message }
}

async function passGate() {
    await userEvent.click(screen.getByRole('button', { name: 'pass the snake gate' }))
}

async function fillForm(values = { name: 'Ada', email: 'ada@example.com', message: 'Hello there' }) {
    const { name, email, message } = fields()
    await userEvent.type(name, values.name)
    await userEvent.type(email, values.email)
    await userEvent.type(message, values.message)
}

const submitButton = () => screen.getByRole('button', { name: /submit-message|sending/ })

beforeEach(() => {
    submitContactAction.mockReset()
})

describe('ContactPage — gating', () => {
    it('shows the snake gate first, not the form', () => {
        render(<ContactPage socialAccounts={[]} />)

        expect(screen.getByRole('button', { name: 'pass the snake gate' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'submit-message' })).not.toBeInTheDocument()
    })

    it('shows the form once the gate is passed', async () => {
        render(<ContactPage socialAccounts={[]} />)

        await passGate()

        expect(submitButton()).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'pass the snake gate' })).not.toBeInTheDocument()
    })

    it('keeps submit disabled until Turnstile issues a token', async () => {
        render(<ContactPage socialAccounts={[]} />)
        await passGate()
        expect(submitButton()).toBeDisabled()

        await userEvent.click(screen.getByRole('button', { name: 'complete turnstile' }))

        expect(submitButton()).toBeEnabled()
    })

    it('disables submit again when the Turnstile token expires', async () => {
        render(<ContactPage socialAccounts={[]} />)
        await passGate()
        await userEvent.click(screen.getByRole('button', { name: 'complete turnstile' }))

        await userEvent.click(screen.getByRole('button', { name: 'expire turnstile' }))

        expect(submitButton()).toBeDisabled()
    })
})

describe('ContactPage — validation', () => {
    async function openFormWithTurnstile() {
        render(<ContactPage socialAccounts={[]} />)
        await passGate()
        await userEvent.click(screen.getByRole('button', { name: 'complete turnstile' }))
    }

    it('requires name, email and message, and does not call the server', async () => {
        await openFormWithTurnstile()

        await userEvent.click(submitButton())

        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Message is required')).toBeInTheDocument()
        expect(submitContactAction).not.toHaveBeenCalled()
    })

    it('treats whitespace-only fields as empty', async () => {
        await openFormWithTurnstile()
        await fillForm({ name: '   ', email: 'ada@example.com', message: '   ' })

        await userEvent.click(submitButton())

        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('Message is required')).toBeInTheDocument()
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })

    it.each(['plain', 'a@b', '@x.com', 'a b@c.de'])('rejects the malformed email "%s"', async (bad) => {
        await openFormWithTurnstile()
        await fillForm({ name: 'Ada', email: bad, message: 'Hi' })

        await userEvent.click(submitButton())

        expect(screen.getByText('Wrong email address')).toBeInTheDocument()
        expect(submitContactAction).not.toHaveBeenCalled()
    })

    it('clears a field error as soon as the user edits that field', async () => {
        await openFormWithTurnstile()
        await userEvent.click(submitButton())
        expect(screen.getByText('Name is required')).toBeInTheDocument()

        await userEvent.type(fields().name, 'A')

        expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument() // others untouched
    })
})

describe('ContactPage — submitting', () => {
    async function readyToSubmit() {
        render(<ContactPage socialAccounts={[]} />)
        await passGate()
        await fillForm()
        await userEvent.click(screen.getByRole('button', { name: 'complete turnstile' }))
    }

    it('sends every field plus both anti-bot tokens', async () => {
        submitContactAction.mockResolvedValue({ success: true })
        await readyToSubmit()

        await userEvent.click(submitButton())

        expect(submitContactAction).toHaveBeenCalledWith({
            name: 'Ada',
            email: 'ada@example.com',
            message: 'Hello there',
            turnstileToken: 'ts-token',
            snakeProofToken: 'snake-token',
        })
    })

    it('shows a "sending..." state and blocks double submits while in flight', async () => {
        let finish!: (v: { success: true }) => void
        submitContactAction.mockReturnValue(new Promise((r) => { finish = r }))
        await readyToSubmit()

        await userEvent.click(submitButton())

        expect(screen.getByRole('button', { name: 'sending...' })).toBeDisabled()
        expect(submitContactAction).toHaveBeenCalledTimes(1)
        finish({ success: true })
    })

    it('shows the thank-you screen on success', async () => {
        submitContactAction.mockResolvedValue({ success: true })
        await readyToSubmit()

        await userEvent.click(submitButton())

        expect(await screen.findByText(/thank you/i)).toBeInTheDocument()
    })

    it('"send-new-message" resets everything and starts over at the snake gate', async () => {
        submitContactAction.mockResolvedValue({ success: true })
        await readyToSubmit()
        await userEvent.click(submitButton())

        await userEvent.click(await screen.findByRole('button', { name: 'send-new-message' }))
        expect(screen.getByRole('button', { name: 'pass the snake gate' })).toBeInTheDocument()

        await passGate()
        const { name, email, message } = fields()
        expect([name.value, email.value, message.value]).toEqual(['', '', ''])
        expect(submitButton()).toBeDisabled() // fresh Turnstile needed as well
    })

    it('after a server-side failure, sends the visitor back through both checks and keeps what they typed', async () => {
        submitContactAction.mockResolvedValue({ success: false, error: 'Too many messages sent.' })
        await readyToSubmit()

        await userEvent.click(submitButton())

        // Form is replaced by the gate because neither token is reusable...
        expect(await screen.findByRole('button', { name: 'pass the snake gate' })).toBeInTheDocument()
        // ...and the visitor is told WHY straight away, without having to replay the game to find out.
        expect(screen.getByRole('alert')).toHaveTextContent('Too many messages sent.')
        expect(screen.getByRole('alert')).toHaveTextContent(/not sent/i)

        await passGate()
        // ...the typed text survives, the server's reason is shown, and a fresh Turnstile is required.
        expect(fields().name.value).toBe('Ada')
        expect(fields().message.value).toBe('Hello there')
        expect(screen.getByText('Too many messages sent.')).toBeInTheDocument()
        expect(submitButton()).toBeDisabled()
    })

    it('treats a thrown error (server unreachable) the same way, with a connectivity message', async () => {
        submitContactAction.mockRejectedValue(new Error('network'))
        await readyToSubmit()

        await userEvent.click(submitButton())

        expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i)
        await passGate()

        expect(screen.getByText(/could not reach the server/i)).toBeInTheDocument()
    })

    it('shows no error panel on a fresh visit to the gate', () => {
        render(<ContactPage socialAccounts={[]} />)

        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('the gate-side error disappears once the gate is passed (the form then shows it next to the message)', async () => {
        submitContactAction.mockResolvedValue({ success: false, error: 'Too many messages sent.' })
        await readyToSubmit()
        await userEvent.click(submitButton())
        await screen.findByRole('alert')

        await passGate()

        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(screen.getAllByText('Too many messages sent.')).toHaveLength(1)
    })
})

describe('ContactPage — sidebar', () => {
    it('groups mailto: and tel: accounts under "contacts" and strips the scheme from the label', () => {
        render(
            <ContactPage
                socialAccounts={[
                    socialAccountDTO({ id: 1, name: 'Email', url: 'mailto:phu@example.dev' }),
                    socialAccountDTO({ id: 2, name: 'Phone', url: 'tel:+84123456789' }),
                ]}
            />,
        )

        const contacts = within(screen.getByRole('region', { name: 'contacts' }))
        expect(contacts.getByRole('link', { name: 'phu@example.dev' })).toHaveAttribute('href', 'mailto:phu@example.dev')
        expect(contacts.getByRole('link', { name: '+84123456789' })).toHaveAttribute('href', 'tel:+84123456789')
    })

    it('puts every other URL under "find-me-also-in", labelled by account name', () => {
        render(<ContactPage socialAccounts={[socialAccountDTO({ name: 'GitHub', url: 'https://github.com/example' })]} />)

        const socials = within(screen.getByRole('region', { name: 'find-me-also-in' }))
        expect(socials.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/example')
        expect(screen.queryByRole('region', { name: 'contacts' })).not.toBeInTheDocument()
    })

    it('omits a group entirely when it would be empty', () => {
        render(<ContactPage socialAccounts={[]} />)

        expect(screen.queryByRole('region', { name: 'contacts' })).not.toBeInTheDocument()
        expect(screen.queryByRole('region', { name: 'find-me-also-in' })).not.toBeInTheDocument()
    })
})
