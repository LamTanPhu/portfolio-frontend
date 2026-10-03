import { expect, test } from '@playwright/test'
import { ADMIN_PASSWORD, loginAsAdmin, resetMockApi } from '../helpers'

test.describe.configure({ mode: 'serial' })

test.beforeEach(async () => {
    await resetMockApi()
})

test.describe('admin', () => {
    test('visiting /admin while logged out bounces to the login page', async ({ page }) => {
        await page.goto('/admin')

        await expect(page).toHaveURL(/\/admin\/login$/)
        await expect(page.getByRole('heading', { name: /admin-login/ })).toBeVisible()
    })

    test('a wrong password shows an error and stays on the login page', async ({ page }) => {
        await page.goto('/admin/login')

        await page.getByPlaceholder('••••••••').fill('definitely-wrong')
        await page.getByRole('button', { name: 'log in' }).click()

        await expect(page.getByText('Wrong password.')).toBeVisible()
        await expect(page).toHaveURL(/\/admin\/login$/)
    })

    test('the right password opens the dashboard, and a reload keeps the session (refresh cookie)', async ({ page }) => {
        await loginAsAdmin(page)
        await expect(page).toHaveURL(/\/admin$/)

        await page.reload()

        await expect(page).toHaveURL(/\/admin$/)
        await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
    })

    test('logout returns to the login page and ends the session', async ({ page }) => {
        await loginAsAdmin(page)

        await page.getByRole('button', { name: 'logout' }).click()
        await expect(page).toHaveURL(/\/admin\/login$/)

        await page.goto('/admin')
        await expect(page).toHaveURL(/\/admin\/login$/)
    })

    test('creates a skill and sees it in the list', async ({ page }) => {
        await loginAsAdmin(page)
        await page.goto('/admin/skills')
        await expect(page.getByText('TypeScript')).toBeVisible()

        await page.getByRole('link', { name: /new skill/ }).click()
        await page.getByPlaceholder('React').fill('Playwright')
        await page.getByRole('combobox').selectOption('devops')
        await page.getByRole('button', { name: 'save' }).click()

        await expect(page).toHaveURL(/\/admin\/skills$/)
        await expect(page.getByText('Playwright')).toBeVisible()
    })

    test('deletes a skill after confirming', async ({ page }) => {
        await loginAsAdmin(page)
        await page.goto('/admin/skills')
        await expect(page.getByText('PostgreSQL')).toBeVisible()

        await page.getByTitle('delete').last().click()
        await expect(page.getByRole('alertdialog')).toContainText('Delete skill?')
        await page.getByRole('alertdialog').getByRole('button', { name: 'delete' }).click()

        await expect(page.getByText('PostgreSQL')).toHaveCount(0)
    })

    test('the login password field is the only credential asked for', async ({ page }) => {
        await page.goto('/admin/login')

        await expect(page.locator('input')).toHaveCount(1)
        await expect(page.locator('input[type="password"]')).toBeVisible()
        expect(ADMIN_PASSWORD.length).toBeGreaterThan(0)
    })
})
