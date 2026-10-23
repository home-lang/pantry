import { expect, test } from '@playwright/test'
import { signIn } from './helpers'

test('login works without JavaScript and preserves email after a failed attempt', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4317/login?next=%2Fpublisher')
  await expect(page.locator('#login-form')).toHaveAttribute('method', 'post')
  await page.getByLabel('Email', { exact: true }).fill('unknown@example.com')
  await page.getByLabel('Password', { exact: true }).fill('bad-password')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Invalid email or password')
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue('unknown@example.com')
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('')
  await expect(page.locator('input[name="next"]')).toHaveValue('/publisher')
  await context.close()
})

test('server login honors safe return destinations and rejects off-site destinations', async ({ request }) => {
  const email = `native-${crypto.randomUUID()}@example.com`
  await request.post('/auth/signup', { data: { name: 'Native Test', email, password: 'test-password-123' } })
  for (const next of ['/publisher', '//example.com', '/\\example.com']) {
    const response = await request.post('/login', { form: { email, password: 'test-password-123', next }, maxRedirects: 0 })
    expect(response.status()).toBe(302)
    expect(response.headers().location).toBe(next === '/publisher' ? '/publisher' : '/account')
    expect(response.headers()['set-cookie']).toContain('HttpOnly')
  }
})

test('publisher pages use the existing cookie session', async ({ page }) => {
  await signIn(page)
  await page.goto('/publisher')
  await expect(page.getByRole('heading', { name: 'Publisher dashboard' })).toBeVisible()
  await expect(page.locator('#publisher-empty')).toBeVisible()
  await page.goto('/login?next=%2Fpublisher')
  await expect(page).toHaveURL(/\/publisher$/)
})
