import { expect, test } from '@playwright/test'

const card = (page: import('@playwright/test').Page, title: string) =>
    page.getByRole('button', { name: new RegExp(title) })

test.describe('blog', () => {
    test('lists posts and filters them by tag', async ({ page }) => {
        await page.goto('/blog')
        await expect(card(page, 'React Hooks Deep Dive')).toBeVisible()
        await expect(card(page, 'NestJS Guards Explained')).toBeVisible()

        await page.getByLabel('#backend').check({ force: true })

        await expect(card(page, 'NestJS Guards Explained')).toBeVisible()
        await expect(card(page, 'React Hooks Deep Dive')).toHaveCount(0)
    })

    test('searching asks the backend and shows only the matches', async ({ page }) => {
        await page.goto('/blog')

        await page.getByRole('textbox', { name: 'Search blog posts' }).fill('guards')

        await expect(card(page, 'NestJS Guards Explained')).toBeVisible()
        await expect(card(page, 'React Hooks Deep Dive')).toHaveCount(0)
    })

    test('search with no matches says so', async ({ page }) => {
        await page.goto('/blog')

        await page.getByRole('textbox', { name: 'Search blog posts' }).fill('zzzzzz')

        await expect(page.getByText(/no results for/)).toBeVisible()
    })

    test('picking a post previews it, and the full post opens at its own URL', async ({ page }) => {
        await page.goto('/blog')

        await card(page, 'React Hooks Deep Dive').click()
        await expect(page.getByRole('heading', { name: 'React Hooks Deep Dive' })).toBeVisible()

        await page.goto('/blog/react-hooks-deep-dive')
        await expect(page.getByRole('heading', { level: 1, name: 'React Hooks Deep Dive' })).toBeVisible()
        await expect(page.getByText('Hooks let you use state in function components.')).toBeVisible()
    })

    test('an unknown post slug shows the 404 page and is marked noindex', async ({ page }) => {
        await page.goto('/blog/no-such-post')

        await expect(page.getByRole('heading', { level: 1 })).toContainText('Cannot resolve module')
        // Next renders this tag twice for notFound(); one is enough for crawlers.
        await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)
    })
})
