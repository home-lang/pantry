import { expect, test } from '@playwright/test'

const packages = Array.from({ length: 1000 }, (_, index) => ({ domain: `test-${String(index).padStart(4, '0')}.example`, platforms: {}, published: false, latestVersion: '1.0.0' }))

test.beforeEach(async ({ page }) => {
  await page.route('**/api/packages', route => route.fulfill({ json: { packages, totals: {}, generatedAt: '2026-01-01T00:00:00Z' } }))
  await page.route('**/api/build-status', route => route.fulfill({ json: { building: [], queue: [], recent: [] } }))
  await page.route('**/api/build-logs/**', route => route.fulfill({ json: { logs: [{ ts: 1, state: 'building', text: 'Example build output' }] } }))
})

test('large catalogs render one page while filtering searches the whole catalog', async ({ page }) => {
  await page.goto('/packages')
  await expect(page.locator('#rows .pkg-row')).toHaveCount(100)
  const pager = page.getByRole('navigation', { name: 'Build result pages' })
  await expect(pager.getByRole('status')).toHaveText('Showing 1–100 of 1000')
  await pager.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(pager.getByRole('status')).toHaveText('Showing 101–200 of 1000')
  await page.getByRole('textbox', { name: 'Filter packages', exact: true }).fill('test-0999')
  await expect(page.locator('#rows .pkg-row')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'test-0999.example', exact: true })).toBeVisible()
})

test('build logs open by keyboard and Escape restores focus', async ({ page }) => {
  await page.goto('/packages')
  const button = page.getByRole('button', { name: 'View build logs for test-0000.example', exact: true })
  await button.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('region', { name: 'Build logs' })).toBeVisible()
  await expect(page.locator('#logpre')).toHaveText(/Example build output/)
  await expect(page.getByRole('button', { name: 'Close build logs' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('region', { name: 'Build logs' })).toBeHidden()
  await expect(button).toBeFocused()
})

test('loading failures offer a working retry', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/packages', route => {
    attempts++
    return route.fulfill(attempts === 1 ? { status: 503, json: { error: 'Unavailable' } } : { json: { packages, totals: {}, generatedAt: '2026-01-01T00:00:00Z' } })
  })
  await page.goto('/packages')
  await expect(page.getByRole('alert')).toContainText('Unable to load')
  await page.getByRole('button', { name: 'Retry loading packages' }).click()
  await expect(page.locator('#rows .pkg-row')).toHaveCount(100)
  await expect(page.getByRole('button', { name: 'Retry loading packages' })).toBeHidden()
})

test('leaving builds closes the live stream and removes drawer spacing', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'EventSource', { value: class {
    close() { sessionStorage.setItem('closed-streams', String(Number(sessionStorage.getItem('closed-streams') || 0) + 1)) }
  } }))
  await page.goto('/packages')
  await page.getByRole('button', { name: 'View build logs for test-0000.example', exact: true }).click()
  await page.locator('footer a[href="/about"]').click()
  await expect(page).toHaveURL(/\/about$/)
  expect(await page.evaluate(() => document.body.style.paddingBottom)).toBe('')
  expect(await page.evaluate(() => sessionStorage.getItem('closed-streams'))).toBe('1')
})

test('rejected rebuild requests never become queued', async ({ page }) => {
  await page.route('**/auth/me', route => route.fulfill({ json: { user: { email: 'ui@example.com' } } }))
  await page.route('**/api/rebuild', route => route.fulfill({ status: 403, json: { error: 'Rebuild not permitted' } }))
  await page.goto('/packages')
  const row = page.locator('#rows .pkg-row').first()
  await row.getByRole('button', { name: 'rebuild', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('Rebuild not permitted')
  await expect(row.getByRole('button', { name: 'retry', exact: true })).toBeEnabled()
  await expect(row.locator('.badge')).toHaveText('unbuilt')
})

test('live queue updates clear completed or removed entries', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'EventSource', { value: class {
    // eslint-disable-next-line pickier/no-unused-vars
    onmessage: ((event: { data: string }) => void) | null = null
    constructor() {
      window.addEventListener('ui-build-status', event => {
        const payload = Reflect.get(event, 'detail')
        this.onmessage?.({ data: JSON.stringify(payload) })
      })
    }
    close() {}
  } }))
  await page.route('**/api/build-status', route => route.fulfill({ json: { building: [], queue: ['test-0000.example'], recent: [] } }))
  await page.goto('/packages')
  await expect(page.locator('#rows .pkg-row').first().locator('.badge')).toHaveText('queued')
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('ui-build-status', { detail: { building: [], queue: [], recent: [] } })))
  await expect(page.getByRole('link', { name: 'test-0000.example', exact: true }).locator('xpath=ancestor::tr').locator('.badge')).toHaveText('unbuilt')
})
