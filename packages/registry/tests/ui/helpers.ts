import { expect, type Page } from '@playwright/test'

export async function signIn(page: Page): Promise<void> {
  const response = await page.request.post('/auth/signup', {
    data: { name: 'UI Test', email: `ui-${crypto.randomUUID()}@example.com`, password: 'test-password-123' },
  })
  expect(response.status()).toBe(201)
  const { sessionToken } = await response.json()
  await page.context().addCookies([{ name: 'pantry_session', value: sessionToken, domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Lax' }])
}

