import { expect, test } from '@playwright/test'

test('clipboard failures are visible and preserve the original control', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Denied')) } }))
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/package/curl.se')
  const button = page.getByRole('button', { name: 'Copy package name', exact: true })
  await button.click()
  await expect(page.getByRole('status')).toContainText('Could not copy')
  await expect(button.locator('svg')).toBeVisible()
  expect(errors).toEqual([])
})

test('copy feedback survives repeated clicks and restores the icon', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() } }))
  await page.goto('/package/curl.se')
  const button = page.getByRole('button', { name: 'Copy package name', exact: true })
  await button.click()
  await expect(button).toHaveText('copied!')
  await button.click()
  await expect(page.getByRole('status')).toContainText('Copied to clipboard')
  await expect(button.locator('svg')).toBeVisible({ timeout: 4000 })
})

test('chart disclosure works by keyboard and hides its contents semantically', async ({ page }) => {
  await page.goto('/package/curl.se')
  const disclosure = page.getByRole('button', { name: 'Downloads (Last 30 Days)' })
  await disclosure.focus()
  await page.keyboard.press('Space')
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#chart-downloads')).toBeHidden()
  await page.keyboard.press('Enter')
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#chart-downloads')).toBeVisible()
})

test('scroll-to-top is absent from keyboard navigation until useful', async ({ page }) => {
  await page.goto('/pricing')
  const button = page.getByRole('button', { name: 'Scroll to top' })
  await expect(button).toBeHidden()
  await page.evaluate(() => window.scrollTo(0, 700))
  await expect(button).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await button.click()
  await expect(button).toBeHidden()
})

test('comparison export announces success and copies the correct table', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => { document.documentElement.dataset.copied = text; return Promise.resolve() } } }))
  await page.goto('/compare?packages=curl.se')
  await page.getByRole('button', { name: 'export markdown' }).click()
  await expect(page.getByRole('status')).toContainText('Comparison copied as Markdown')
  await expect(page.locator('html')).toHaveAttribute('data-copied', /curl\.se/)
  await expect(page.locator('html')).toHaveAttribute('data-copied', /Comparison\n\n\| Metric/)
})
