import { describe, expect, test } from 'bun:test'
import { loadRecipe } from '../scripts/recipe-loader'
import { evaluateCondition } from '../scripts/buildkit'
import { mysqlCalendarVersions, mysqlDistributionUrl } from '../scripts/mysql-distribution'

function selectedScript(script: unknown[], platform: string, version: string): string {
  return script.flatMap((value) => {
    if (typeof value === 'string') return [value]
    const step = value as { if?: string, run: string | string[] }
    return evaluateCondition(step.if, platform, version) ? [step.run].flat() : []
  }).join('\n')
}

describe('MySQL runtime distributions', () => {
  for (const [platform, asset] of [
    ['linux-x86-64', 'linux-glibc2.28-x86_64.tar.xz'],
    ['linux-arm64', 'linux-glibc2.28-aarch64.tar.xz'],
    ['darwin-arm64', 'macos15-arm64.tar.gz'],
  ]) {
    test(`selects the official 26.7 archive for ${platform}`, async () => {
      const loaded = (await loadRecipe('mysql.com', platform, '26.7.0')).recipe
      expect(loaded.distributable?.url).toBe(`https://cdn.mysql.com/Downloads/MySQL-26.7/mysql-26.7.0-${asset}`)
      expect(loaded.distributable?.['strip-components']).toBe(1)
      const script = selectedScript(loaded.build!.script as unknown[], platform!, '26.7.0')
      expect(script).toContain('cp -R ../bin ../include ../lib ../share ../support-files')
      expect(script).not.toContain('cmake ..')
      expect(loaded.build!.dependencies?.['cmake.org']).toBeUndefined()
      expect(loaded.test.required).toBe(true)
      expect(loaded.test.script.join('\n')).toContain('mysqld --version')
    })
  }
  test('keeps the supported 8.0 source family and its native build', async () => {
    const loaded = (await loadRecipe('mysql.com', 'linux-x86-64', '8.0.45')).recipe
    expect(loaded.distributable?.url).toContain('mysql-boost-')
    const script = selectedScript(loaded.build!.script as unknown[], 'linux-x86-64', '8.0.45')
    expect(script).toContain('cmake ..')
    expect(loaded.build!.dependencies?.['cmake.org']).toBe('^3')
    expect(script).not.toContain('cp -R ../bin ../include ../lib ../share ../support-files')
  })
})


test('discovers server calendar tags only after verifying their native distribution', async () => {
  const requests: string[] = []
  const versions = await mysqlCalendarVersions(async (url) => {
    requests.push(url)
    if (url.includes('api.github.com')) return Response.json([
      { name: 'mysql-26.10.0' }, { name: 'mysql-26.8.0' },
      { name: 'mysql-cluster-99.1.0' }, { name: 'mysql-9.4.0' },
      { name: 'mysql-26.7.0-rc1' },
    ])
    return new Response(null, { status: url.includes('26.8.0') ? 404 : 200 })
  })
  expect(versions).toEqual(['26.10.0', '26.7.0'])
  expect(requests).toHaveLength(4)
  expect(requests.some(url => url.includes('99.1.0') || url.includes('9.4.0'))).toBe(false)
})

test('fails discovery on network errors instead of downgrading the catalog to 8.0', async () => {
  await expect(mysqlCalendarVersions(async () => new Response(null, { status: 503 }))).rejects.toThrow('HTTP 503')
  expect(() => mysqlDistributionUrl('26.7.0', 'windows-x64')).toThrow('Unsupported MySQL runtime platform')
  expect(() => mysqlDistributionUrl('26.7.0/../../other', 'linux-x86-64')).toThrow('Invalid MySQL version')
})
