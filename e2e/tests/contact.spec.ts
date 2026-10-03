import { expect, test } from '@playwright/test'

// Reaching the contact form means beating the snake game (10 dots on a board
// with random food), which a test can't do reliably. The form logic itself —
// validation, submit, error recovery — is covered by the ContactPage
// component tests; this journey checks the gate is wired to the real page.
test.describe('contact', () => {
    test('shows the snake game instead of the form, and has asked the backend for a challenge', async ({ page }) => {
        const challenge = page.waitForResponse((r) => r.url().endsWith('/captcha/snake/challenge') && r.request().method() === 'POST')

        await page.goto('/contact')

        expect((await challenge).ok()).toBe(true)
        await expect(page.getByRole('heading', { name: /beat the snake game/i })).toBeVisible()
        await expect(page.getByRole('button', { name: 'submit-message' })).toHaveCount(0)
    })

    test('lists the owner\'s contact methods in the sidebar', async ({ page }) => {
        await page.goto('/contact')

        await expect(page.getByRole('link', { name: 'hello@example.dev' }).first()).toHaveAttribute('href', 'mailto:hello@example.dev')
    })
})
