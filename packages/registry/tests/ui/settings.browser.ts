import { expect, test } from '@playwright/test'

test('system theme follows OS changes and accents follow every theme toggle', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/settings')
  await page.getByRole('button', { name: 'System', exact: true }).click()
  await expect(page.getByRole('button', { name: 'System', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.locator('html').evaluate(el => {
    el.style.setProperty('--accent', 'red')
    el.style.setProperty('--accent-hover', 'red')
  })
  await page.getByRole('button', { name: 'Purple', exact: true }).click()
  expect(await page.locator('html').evaluate(el => el.style.getPropertyValue('--accent'))).toBe('')
  const lightAccent = await page.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--accent'))
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const darkAccent = await page.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--accent'))
  expect(darkAccent).not.toBe(lightAccent)
  await expect(page.getByRole('button', { name: 'Dark', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('d')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('settings work with blocked storage and report that changes cannot persist', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable') }
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable') }
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/settings')
  await page.getByRole('checkbox', { name: 'Compact mode' }).check()
  await expect(page.locator('html')).toHaveClass(/compact/)
  await page.getByRole('button', { name: 'Purple', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Purple', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status')).toContainText('cannot be saved')
  expect(errors).toEqual([])
})

test('saved install and search defaults affect the next task', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('combobox', { name: 'Default install method' }).selectOption('curl')
  await page.getByRole('combobox', { name: 'Default search view' }).selectOption('grid')
  await page.goto('/package/curl.se')
  await expect(page.locator('[data-install-method]').first()).toHaveAttribute('data-install-method', 'curl')
  const form = page.locator('#header-search-form')
  await expect(form.locator('input[name="view"]')).toHaveValue('grid')
  await page.getByRole('combobox', { name: 'Search packages' }).fill('curl')
  await page.getByRole('combobox', { name: 'Search packages' }).press('Enter')
  await expect(page).toHaveURL(/view=grid/)
})
