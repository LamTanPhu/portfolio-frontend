// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminLoginPage } from './AdminLoginPage'

const login = vi.hoisted(() => vi.fn())
const replace = vi.hoisted(() => vi.fn())

vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ login }) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, push: vi.fn() }) }))

const passwordInput = () => screen.getByPlaceholderText('••••••••')
const submit = () => screen.getByRole('button', { name: /log in|checking/ })

beforeEach(() => {
    login.mockReset()
    replace.mockReset()
})

describe('AdminLoginPage', () => {
    it('asks for a password only (no username/email field)', () => {
        render(<AdminLoginPage />)

        expect(screen.queryAllByRole('textbox')).toHaveLength(0) // password inputs don't have the "textbox" role
        expect(passwordInput()).toHaveAttribute('type', 'password')
    })

    it('keeps the button disabled until something is typed', async () => {
        render(<AdminLoginPage />)
        expect(submit()).toBeDisabled()

        await userEvent.type(passwordInput(), 'x')

        expect(submit()).toBeEnabled()
    })

    it('logs in with the typed password and goes to /admin', async () => {
        login.mockResolvedValue(undefined)
        render(<AdminLoginPage />)

        await userEvent.type(passwordInput(), 'hunter2')
        await userEvent.click(submit())

        expect(login).toHaveBeenCalledWith('hunter2')
        expect(replace).toHaveBeenCalledWith('/admin')
    })

    it('submits with the Enter key too', async () => {
        login.mockResolvedValue(undefined)
        render(<AdminLoginPage />)

        await userEvent.type(passwordInput(), 'hunter2{Enter}')

        expect(login).toHaveBeenCalledWith('hunter2')
    })

    it('shows "Wrong password." and stays on the page when login fails', async () => {
        login.mockRejectedValue(new Error('401'))
        render(<AdminLoginPage />)

        await userEvent.type(passwordInput(), 'bad')
        await userEvent.click(submit())

        expect(await screen.findByText('Wrong password.')).toBeInTheDocument()
        expect(replace).not.toHaveBeenCalled()
        expect(submit()).toBeEnabled() // can try again
    })

    it('shows "checking..." and disables the button while the request is in flight', async () => {
        let finish!: () => void
        login.mockReturnValue(new Promise<void>((r) => { finish = r }))
        render(<AdminLoginPage />)

        await userEvent.type(passwordInput(), 'pw')
        await userEvent.click(submit())

        expect(screen.getByRole('button', { name: 'checking...' })).toBeDisabled()
        finish()
    })

    it('clears the previous error when trying again', async () => {
        login.mockRejectedValueOnce(new Error('401')).mockResolvedValueOnce(undefined)
        render(<AdminLoginPage />)
        await userEvent.type(passwordInput(), 'bad')
        await userEvent.click(submit())
        await screen.findByText('Wrong password.')

        await userEvent.click(submit())

        expect(screen.queryByText('Wrong password.')).not.toBeInTheDocument()
        expect(replace).toHaveBeenCalledWith('/admin')
    })
})
