import { expect, test } from '@playwright/test'

test('table view renders and survives sorting', async ({ page }) => {
  await page.goto('/search?q=curl')
  await page.getByRole('link', { name: 'Table view', exact: true }).click()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Table view' })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('combobox', { name: 'Sort:' }).selectOption('name')
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page).toHaveURL(/view=table/)
})

test('search text survives pagination and view changes without double escaping', async ({ page }) => {
  const query = 'UI & fixture'
  await page.goto(`/search?q=${encodeURIComponent(query)}&sort=name`)
  await expect(page.locator('#search-input')).toHaveValue(query)
  await page.getByRole('link', { name: 'Next page' }).click()
  expect(new URL(page.url()).searchParams.get('q')).toBe(query)
  expect(new URL(page.url()).searchParams.get('page')).toBe('2')
  await expect(page.getByRole('navigation', { name: 'Search result pages' }).locator('[aria-current="page"]')).toHaveText('2')
  await page.getByRole('link', { name: 'Grid view', exact: true }).click()
  expect(new URL(page.url()).searchParams.get('q')).toBe(query)
  await expect(page.locator('#search-input')).toHaveValue(query)
})

test('comparison inputs remain human-readable after a submitted list', async ({ page }) => {
  await page.goto('/compare?packages=curl.se%2Ccurl.se')
  await expect(page.getByRole('textbox', { name: 'Package names to compare' })).toHaveValue('curl.se,curl.se')
})
