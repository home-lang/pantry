import { expect, test } from '@playwright/test'
import { signIn } from './helpers'

test('publisher metadata is text and the signed-in layout fits mobile', async ({ page }) => {
  await signIn(page)
  await page.route('**/publisher/api/packages', route => route.fulfill({ json: { packages: [{ name: '@ui/test', description: '<img src=x onerror=alert(1)>', latestVersion: '1.0.0', totalDownloads: 12, commitCount: 1 }] } }))
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/publisher')
  await expect(page.getByRole('cell', { name: /<img src=x/ })).toBeVisible()
  await expect(page.locator('#publisher-tbody img')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  await page.goto('/account')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('publisher loading errors offer retry', async ({ page }) => {
  await signIn(page)
  let attempts = 0
  await page.route('**/publisher/api/packages', route => route.fulfill(++attempts === 1 ? { status: 503, json: { error: 'Unavailable' } } : { json: { packages: [] } }))
  await page.goto('/publisher')
  await expect(page.getByRole('alert')).toContainText('Unable to load packages')
  await page.getByRole('button', { name: 'Retry loading packages' }).click()
  await expect(page.locator('#publisher-empty')).toBeVisible()
})

test('saving publisher metadata prevents duplicate requests and retains edits on failure', async ({ page }) => {
  await signIn(page)
  let saves = 0
  await page.route('**/publisher/api/packages/curl.se', async route => {
    if (route.request().method() === 'PATCH') {
      saves++
      await new Promise(resolve => setTimeout(resolve, 250))
      await route.fulfill({ status: 503, json: { error: 'Please try again' } })
    }
    else await route.fulfill({ json: { package: { name: 'curl.se', description: 'Old description', latestVersion: '<img src=x>' }, stats: {}, commits: [] } })
  })
  await page.goto('/publisher/package/curl.se')
  await page.getByLabel('Description', { exact: true }).fill('Keep this edit')
  const save = page.getByRole('button', { name: 'Save changes' })
  await save.click()
  await expect(save).toBeDisabled()
  await expect(page.locator('#save-status')).toContainText('Please try again')
  await expect(save).toBeEnabled()
  await expect(page.getByLabel('Description', { exact: true })).toHaveValue('Keep this edit')
  await expect(page.locator('#pkg-stats img')).toHaveCount(0)
  expect(saves).toBe(1)
})
