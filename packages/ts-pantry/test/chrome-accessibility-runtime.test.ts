import { expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { loadRecipe } from '../scripts/recipe-loader'
import { recipe as chrome } from '../src/recipes/google.com/chrome'
import { googlecomchromePackage } from '../src/packages/google.com/chrome'

const domain = 'freedesktop.org/at-spi2-core/libatspi'
test('Chrome declares its directly linked AT-SPI client ABI in both installer catalogs', () => {
  expect(chrome.dependencies?.[domain]).toBe('~2.38')
  expect(googlecomchromePackage.dependencies).toContain(`${domain}~2.38`)
})

test('the AT-SPI client package owns its library surface and a required native ABI check', async () => {
  const { recipe } = await loadRecipe(domain, 'linux-x86-64', '2.38.0')
  expect(recipe.publish?.include).toContain('lib/libatspi.so*')
  expect(recipe.publish?.include.some(path => path.startsWith('libexec/'))).toBe(false)
  expect(recipe.dependencies?.['gnome.org/glib']).toBe('^2')
  expect(recipe.dependencies?.['freedesktop.org/dbus']).toBe('^1')
  expect(recipe.build?.dependencies?.['python.org']).toBe('~3.12')
  expect(recipe.build?.dependencies?.['bun.com']).toBe('^1.3')
  const bun = await loadRecipe('bun.com', 'linux-x86-64', '1.4.2')
  expect(bun.recipe).toBeDefined()
  expect(recipe.build?.dependencies?.['bun.sh']).toBeUndefined()
  expect(recipe.test?.required).toBe(true)
  expect(JSON.stringify(recipe.test?.script)).toContain('ATSPI_CLIENT_OK')
})

test('the native publisher selects the exact AT-SPI client release on both Linux architectures', () => {
  for (const platform of ['linux-x86-64', 'linux-arm64']) {
    const p = spawnSync(process.execPath, ['scripts/build-all-packages.ts', '--platform', platform, '-p', `${domain}@2.38.0`, '--source-only', '--print-selected'], { cwd: resolve(import.meta.dir, '..'), encoding: 'utf8' })
    expect(p.status, p.stderr).toBe(0)
    expect(p.stdout.trim()).toBe(`${domain}@2.38.0`)
  }
})


test('Chrome declares the libudev client component', () => {
  expect(chrome.dependencies?.['systemd.io/libudev']).toBe('^262')
  expect(chrome.dependencies?.['systemd.io']).toBeUndefined()
})
