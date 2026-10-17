import { expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { loadRecipe } from '../scripts/recipe-loader'

test('the JDK HarfBuzz release is publishable with its own declared ICU ABI', async () => {
  const root = resolve(import.meta.dir, '..')
  const selection = spawnSync(process.execPath, ['scripts/build-all-packages.ts', '--platform', 'linux-x86-64', '-p', 'harfbuzz.org@8.5.0', '--source-only', '--print-selected'], { cwd: root, encoding: 'utf8' })
  expect(selection.status, selection.stderr).toBe(0)
  expect(selection.stdout.trim()).toBe('harfbuzz.org@8.5.0')
  for (const [version, icu] of [['8.5.0', '^71'], ['14.6.0', '^77']]) {
    const { recipe } = await loadRecipe('harfbuzz.org', 'linux-x86-64', version)
    expect(recipe.dependencies?.['unicode.org']).toBe(icu)
    expect(recipe.test?.required).toBe(true)
  }
})

test('other unverified legacy HarfBuzz releases still fail publication preflight', () => {
  const root = resolve(import.meta.dir, '..')
  for (const version of ['8.4.0', '9.0.0']) {
    const selection = spawnSync(process.execPath, ['scripts/build-all-packages.ts', '--platform', 'linux-x86-64', '-p', `harfbuzz.org@${version}`, '--source-only', '--print-selected'], { cwd: root, encoding: 'utf8' })
    expect(selection.status).toBe(1)
    expect(selection.stderr).toContain('is excluded from publication')
  }
})

test('the legacy ICU ABI required by HarfBuzz can be published on the missing ARM platform', () => {
  const selection = spawnSync(process.execPath, ['scripts/build-all-packages.ts', '--platform', 'linux-arm64', '-p', 'unicode.org@71.1.0', '--source-only', '--print-selected'], { cwd: resolve(import.meta.dir, '..'), encoding: 'utf8' })
  expect(selection.status, selection.stderr).toBe(0)
  expect(selection.stdout.trim()).toBe('unicode.org@71.1.0')
})
