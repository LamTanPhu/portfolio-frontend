import { test } from '@playwright/test'
import { expectNoSeriousA11yViolations } from '../helpers'

test.describe('accessibility (axe, serious + critical only)', () => {
    for (const [name, path] of [
        ['home', '/'],
        ['projects', '/projects'],
        ['blog', '/blog'],
        ['404 page', '/this-route-does-not-exist'],
    ] as const) {
        test(`${name} has no serious violations`, async ({ page }) => {
            await page.goto(path)
            await expectNoSeriousA11yViolations(page)
        })
    }

    // The contact form sits behind the snake game, so its labels are checked in the
    // FormField / ContactPage unit tests instead.
    test('admin login page has no serious violations (password field has an accessible name)', async ({ page }) => {
        await page.goto('/admin/login')
        await expectNoSeriousA11yViolations(page)
    })
})
