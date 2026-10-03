import { expect, test } from '@playwright/test'

test.describe('projects', () => {
    test('lists the published projects', async ({ page }) => {
        await page.goto('/projects')

        await expect(page.getByRole('link', { name: 'Portfolio Site' }).first()).toBeVisible()
        await expect(page.getByRole('link', { name: 'Snake Game' }).first()).toBeVisible()
    })

    test('opens a project detail page with its description', async ({ page }) => {
        await page.goto('/projects')

        await page.getByRole('link', { name: 'Portfolio Site' }).first().click()

        await expect(page).toHaveURL(/\/projects\/portfolio-site$/)
        await expect(page.getByRole('heading', { level: 1, name: 'Portfolio Site' })).toBeVisible()
        await expect(page.getByText('The site you are looking at.')).toBeVisible()
    })

    // Characterisation: unknown slugs render the 404 page but respond with HTTP
    // 200 (the loading.tsx boundary streams the status before notFound() runs).
    // The page carries <meta name="robots" content="noindex">, so search engines
    // skip it. If the status ever becomes a real 404, change this to expect 404.
    test('an unknown project slug shows the 404 page and is marked noindex', async ({ page }) => {
        await page.goto('/projects/no-such-project')

        await expect(page.getByRole('heading', { level: 1 })).toContainText('Cannot resolve module')
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    })
})
