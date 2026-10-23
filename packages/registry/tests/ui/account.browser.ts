import { expect, test } from '@playwright/test'
import { signIn } from './helpers'

test('cookie sessions work without browser storage and token dialogs start closed', async ({ page }) => {
  await signIn(page)
  await page.goto('/account')
  await expect(page.getByRole('heading', { name: 'Account', exact: true })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Create API Token' })).toBeHidden()
  await page.getByRole('button', { name: 'Create token', exact: true }).click()
  await expect(page.getByLabel('Token name')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Create API Token' })).toBeHidden()
})

test('new token remains available to copy and appears in the token list', async ({ page }) => {
  await signIn(page)
  await page.goto('/account')
  await page.getByRole('button', { name: 'Create token', exact: true }).click()
  await page.getByLabel('Token name').fill('Browser test token')
  await page.getByRole('dialog', { name: 'Create API Token' }).getByRole('button', { name: 'Create token' }).click()
  await expect(page.locator('#new-token-value')).toContainText('ptry_')
  const secret = await page.locator('#new-token-value').textContent()
  await page.waitForTimeout(1000)
  await expect(page.locator('#new-token-value')).toHaveText(secret!)
  await expect(page.getByRole('cell', { name: 'Browser test token', exact: true })).toBeVisible()
  expect(await page.locator('html').evaluate(() => localStorage.getItem('pantry_session'))).toBeNull()
})

test('token creation failures are inline and allow retry', async ({ page }) => {
  await signIn(page)
  await page.route('**/auth/tokens', route => route.fulfill({ status: 503, json: { error: 'Please try again shortly' } }))
  await page.goto('/account')
  await page.getByRole('button', { name: 'Create token', exact: true }).click()
  await page.getByLabel('Token name').fill('Retry token')
  const dialog = page.getByRole('dialog', { name: 'Create API Token' })
  await dialog.getByRole('button', { name: 'Create token' }).click()
  await expect(dialog.getByRole('alert')).toHaveText('Please try again shortly')
  await expect(dialog.getByRole('button', { name: 'Create token' })).toBeEnabled()
  await expect(page.getByLabel('Token name')).toHaveValue('Retry token')
})
