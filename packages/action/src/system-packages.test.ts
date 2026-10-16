import { describe, expect, it } from 'bun:test'
import { installResolvedSystemPackage } from './system-packages'

describe('native system package dependency graphs', () => {
  it('installs Git through the native resolver and returns its exact version', async () => {
    const requests: string[] = []
    const version = await installResolvedSystemPackage('git-scm.org', '2.53.0', {
      installDir: '/unused',
      nativeInstall: async spec => { requests.push(spec); return 0 },
    })
    expect(requests).toEqual(['git-scm.org@2.53.0'])
    expect(version).toBe('2.53.0')
  })

  it('fails required packages when the native installer cannot provide them', async () => {
    await expect(installResolvedSystemPackage('missing.example', '1.0.0', {
      installDir: '/unused', nativeInstall: async () => 1,
    })).rejects.toThrow('Pantry could not install required package missing.example@1.0.0')
  })

  it('preserves native dependency resolution errors', async () => {
    await expect(installResolvedSystemPackage('git-scm.org', '2.53.0', {
      installDir: '/unused', nativeInstall: async () => { throw new Error('A required library is unavailable') },
    })).rejects.toThrow('A required library is unavailable')
  })
})
