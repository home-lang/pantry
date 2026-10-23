import { expect, test } from '@playwright/test'

for (const width of [320, 375, 640, 768, 1024, 1099, 1100, 1280, 2048]) {
  test(`pricing layout fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/pricing')
    await expect(page.getByRole('heading', { name: 'Plans', exact: true })).toBeVisible()
    await expect(page.getByRole('dialog')).toBeHidden()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    const nav = page.getByRole('navigation', { name: 'main navigation' })
    const toggle = page.getByRole('button', { name: 'Toggle navigation' })
    if (width < 1100) {
      await expect(nav).toBeHidden()
      await expect(toggle).toBeVisible()
      await toggle.click()
      await expect(nav).toBeVisible()
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
      const box = await nav.boundingBox()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width)
      await page.keyboard.press('Escape')
      await expect(nav).toBeHidden()
    }
    else {
      await expect(toggle).toBeHidden()
      await expect(nav).toBeVisible()
      const logo = await page.locator('header a[href="/"]').boundingBox()
      const box = await nav.boundingBox()
      expect(box!.x).toBeGreaterThan(logo!.x + logo!.width)
    }
  })
}

test('shortcuts are a modal with focus containment, Escape and focus restoration', async ({ page }) => {
  await page.goto('/pricing')
  const trigger = page.getByRole('button', { name: /for shortcuts/ })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused()
  // Native modality makes the rest of the document inert.
  await trigger.focus()
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('Escape closes shortcuts even when keyboard shortcuts are disabled', async ({ page }) => {
  await page.goto('/pricing')
  await page.evaluate(() => localStorage.setItem('pantry-shortcuts', 'false'))
  await page.getByRole('button', { name: /for shortcuts/ }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('shortcut keys respect editable fields and modifier keys', async ({ page }) => {
  await page.goto('/pricing')
  await page.keyboard.press('Control+h')
  await expect(page).toHaveURL(/\/pricing$/)
  await page.getByRole('combobox', { name: 'Search packages' }).focus()
  await page.keyboard.type('h?d')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page).toHaveURL(/\/pricing$/)
})

test('theme and shared layout survive client navigation and history', async ({ page }) => {
  await page.goto('/about')
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  for (const path of ['/pricing', '/settings', '/privacy', '/about']) {
    await page.locator(`footer a[href="${path}"]`).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.locator('.mobile-nav-toggle')).toBeHidden()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    expect(await page.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--bg').trim())).not.toBe('')
  }
  await page.goBack()
  await expect(page).toHaveURL(/\/privacy$/)
  await expect(page.getByRole('dialog')).toBeHidden()
})

for (const path of ['/', '/about', '/privacy', '/accessibility', '/settings', '/login', '/signup', '/compare', '/stats', '/packages', '/search?q=curl', '/search?q=curl&view=grid', '/search?q=curl&view=table', '/package/curl.se', '/compare?packages=curl.se']) {
  test(`mobile page fits: ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.getByRole('dialog')).toBeHidden()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    expect(errors).toEqual([])
  })
}

test('closed native dialog stays hidden if application styles are unavailable', async ({ page }) => {
  await page.goto('/pricing')
  await page.evaluate(() => document.querySelectorAll('style').forEach(style => style.remove()))
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('theme and menu still work after repeated navigation', async ({ page }) => {
  await page.goto('/about')
  for (const path of ['/pricing', '/settings', '/about']) {
    await page.locator(`footer a[href="${path}"]`).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
  }
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.setViewportSize({ width: 375, height: 740 })
  await page.getByRole('button', { name: 'Toggle navigation' }).click()
  await expect(page.getByRole('navigation', { name: 'main navigation' })).toBeVisible()
})

test('search cancels cleared queries and ignores late responses', async ({ page }) => {
  await page.route('**/search?*format=json*', async route => {
    const q = new URL(route.request().url()).searchParams.get('q')
    await new Promise(resolve => setTimeout(resolve, q === 'old' ? 700 : 50))
    await route.fulfill({ json: { results: [{ name: q, description: '<img src=x onerror=alert(1)>' }] } })
  })
  await page.goto('/pricing')
  const input = page.getByRole('combobox', { name: 'Search packages' })
  await input.fill('old')
  await page.waitForRequest('**/search?q=old&format=json&limit=8')
  await input.fill('new')
  await expect(page.locator('.item-name')).toHaveText('new')
  await page.waitForTimeout(800)
  await expect(page.locator('.item-name')).toHaveText('new')
  await expect(page.locator('.item-desc')).toHaveText('<img src=x onerror=alert(1)>')
  await expect(page.locator('.search-dropdown img')).toHaveCount(0)
  await page.keyboard.press('ArrowDown')
  await expect(input).toHaveAttribute('aria-activedescendant', 'header-result-0')
  await page.keyboard.press('Escape')
  await expect(input).toHaveAttribute('aria-expanded', 'false')
  await input.fill('clear')
  await input.fill('')
  await page.waitForTimeout(350)
  await expect(page.locator('.search-dropdown')).toBeHidden()
})

test('restricted browser storage leaves shared controls usable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked') }
    Storage.prototype.setItem = () => { throw new Error('Storage blocked') }
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/pricing')
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  expect(errors).toEqual([])
})

test('clearing a pending query prevents the network request', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => {
    if (request.url().includes('format=json')) requests.push(request.url())
  })
  await page.goto('/pricing')
  const input = page.getByRole('combobox', { name: 'Search packages' })
  await input.fill('curl')
  await input.fill('')
  await page.waitForTimeout(350)
  expect(requests).toEqual([])
})

test('mobile search shortcut opens the menu and focuses search', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 })
  await page.goto('/pricing')
  await page.keyboard.press('/')
  await expect(page.getByRole('combobox', { name: 'Search packages' })).toBeFocused()
  await expect(page.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation', { name: 'main navigation' })).toBeHidden()
})

test('package tabs work with the keyboard', async ({ page }) => {
  await page.goto('/package/curl.se')
  await page.locator('#tab-overview').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('#tab-versions')).toBeChecked()
  await expect(page.locator('.tab-panel-versions')).toBeVisible()
  await expect(page.locator('.tab-panel-overview')).toBeHidden()
})

test('shortcuts fit a small landscape viewport and close from the backdrop', async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 })
  await page.goto('/pricing')
  await page.keyboard.press('?')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const box = await dialog.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(568)
  expect(box!.y + box!.height).toBeLessThanOrEqual(320)
  await page.mouse.click(2, 2)
  await expect(dialog).toBeHidden()
})

test('reduced motion preference applies to page animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/pricing')
  const duration = await page.locator('.animate-fade-in').evaluate(el => Number.parseFloat(getComputedStyle(el).animationDuration))
  expect(duration).toBeLessThanOrEqual(0.001)
})
