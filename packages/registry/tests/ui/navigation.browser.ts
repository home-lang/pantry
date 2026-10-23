import { expect, test } from '@playwright/test'

test('current navigation follows client-side route changes', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('header a[href="/about"]')).toHaveAttribute('aria-current', 'page')
  await page.locator('footer a[href="/pricing"]').click()
  await expect(page.locator('header a[href="/pricing"]')).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('header a[href="/about"]')).not.toHaveAttribute('aria-current', 'page')
})

test('mobile primary-search shortcut does not cover the search field with the menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 })
  await page.goto('/')
  await page.keyboard.press('/')
  await expect(page.locator('#search-input')).toBeFocused()
  await expect(page.getByRole('navigation', { name: 'main navigation' })).toBeHidden()
})

test('mobile navigation closes when users return to page content', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 })
  await page.goto('/pricing')
  await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await expect(page.getByRole('navigation', { name: 'main navigation' })).toBeVisible()
  await page.mouse.click(10, 700)
  await expect(page.getByRole('navigation', { name: 'main navigation' })).toBeHidden()
  await expect(page.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded', 'false')
})
