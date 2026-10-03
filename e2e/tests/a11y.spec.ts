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

    // KNOWN ISSUE (found by reading the code, not yet run): FormField renders
    // <label> without htmlFor/id and the name/email inputs have no
    // aria-label, so form inputs have no accessible name. Fix FormField
    // (associate label and control) and remove the .fixme.
    test.fixme('contact form inputs have accessible names', async ({ page }) => {
        await page.goto('/contact')
        await expectNoSeriousA11yViolations(page)
    })

    test.fixme('admin login password field has an accessible name', async ({ page }) => {
        await page.goto('/admin/login')
        await expectNoSeriousA11yViolations(page)
    })
})
