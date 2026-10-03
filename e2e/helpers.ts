import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

export const MOCK_API = 'http://localhost:3001'
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'e2e-password'

/** Puts the mock API back to its initial fixtures (call from beforeEach in stateful specs). */
export async function resetMockApi(): Promise<void> {
    const res = await fetch(`${MOCK_API}/__test/reset`, { method: 'POST' })
    if (!res.ok) throw new Error(`mock API reset failed: ${res.status}`)
}

/**
 * Fails on serious/critical accessibility violations.
 * color-contrast is excluded on purpose: it depends on the theme palette (CSS
 * variables), so review it as a design decision, not as a test failure.
 */
export async function expectNoSeriousA11yViolations(page: Page): Promise<void> {
    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(
        serious.map((v) => ({ rule: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })),
        'serious/critical accessibility violations',
    ).toEqual([])
}

export async function loginAsAdmin(page: Page): Promise<void> {
    await page.goto('/admin/login')
    await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'log in' }).click()
    await page.waitForURL('**/admin')
}
