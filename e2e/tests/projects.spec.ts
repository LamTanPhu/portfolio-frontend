import { expect, test } from '@playwright/test'

test.describe('projects', () => {
    test('lists the published projects', async ({ page }) => {
        await page.goto('/projects')

        // Card titles are links named "Project N // _slug".
        await expect(page.getByRole('link', { name: /_portfolio-site/ })).toBeVisible()
        await expect(page.getByRole('link', { name: /_snake-game/ })).toBeVisible()
    })

    test('opens a project detail page with its description', async ({ page }) => {
        await page.goto('/projects')

        await page.getByRole('link', { name: /_portfolio-site/ }).click()

        await expect(page).toHaveURL(/\/projects\/portfolio-site$/)
        await expect(page.getByRole('heading', { level: 1, name: 'Portfolio Site' })).toBeVisible()
        await expect(page.getByText('The site you are looking at.')).toBeVisible()
    })

    // Regression: this used to answer HTTP 200 (a root loading.tsx made Next send the status
    // before notFound() ran). Search engines must see a real 404.
    test('an unknown project slug is a real HTTP 404, shows the 404 page and is marked noindex', async ({ page }) => {
        const response = await page.goto('/projects/no-such-project')

        expect(response?.status()).toBe(404)
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Cannot resolve module')
        // Next renders this tag twice for notFound(); one is enough for crawlers.
        await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)
    })

    test('a known project is still HTTP 200', async ({ page }) => {
        const response = await page.goto('/projects/portfolio-site')

        expect(response?.status()).toBe(200)
    })
})
