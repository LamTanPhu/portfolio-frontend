import { expect, test } from '@playwright/test'

test.describe('site navigation', () => {
    test('home page loads with the owner name and the right title', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByRole('heading', { level: 1, name: 'Lam Tan Phu' })).toBeVisible()
        await expect(page).toHaveTitle(/Lam Tan Phu/)
    })

    test('the tab bar moves between the main sections', async ({ page }) => {
        await page.goto('/')

        await page.getByTitle('_projects').first().click()
        await expect(page).toHaveURL(/\/projects$/)

        await page.getByTitle('_blog').first().click()
        await expect(page).toHaveURL(/\/blog$/)

        await page.getByTitle('_contact-me').first().click()
        await expect(page).toHaveURL(/\/contact$/)

        await page.getByTitle('_about-me').first().click()
        await expect(page).toHaveURL(/\/about$/)
    })

    test('an unknown route shows the custom 404 page and a way home', async ({ page }) => {
        const response = await page.goto('/this-route-does-not-exist')

        expect(response?.status()).toBe(404)
        await expect(page.getByRole('heading', { level: 1 })).toContainText('Cannot resolve module')
        await page.getByRole('link', { name: /open home/ }).click()
        await expect(page).toHaveURL(/\/$/)
    })

    test('the sitemap lists published projects and posts', async ({ request }) => {
        const res = await request.get('/sitemap.xml')

        expect(res.ok()).toBe(true)
        const xml = await res.text()
        expect(xml).toContain('/projects/portfolio-site')
        expect(xml).toContain('/blog/react-hooks-deep-dive')
    })
})
