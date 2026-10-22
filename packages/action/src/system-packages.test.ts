import { describe, expect, it } from 'bun:test'
import { installResolvedSystemPackage, installResolvedSystemPackages } from './system-packages'

describe('native system package dependency graphs', () => {
  it('preserves both declared roots for the native dependency solver, in either order', async () => {
    const roots = [
      { domain: 'openjdk.org', version: '17.0.20.8' },
      { domain: 'android.com/cmdline-tools', version: '14742923.0.0' },
    ]
    for (const requests of [roots, [...roots].reverse()]) {
      const plans: string[][] = []
      const versions = await installResolvedSystemPackages(requests, {
        installDir: '/unused', nativeInstall: async specs => {
          plans.push(specs)
          return 0
        },
      })
      expect(plans).toEqual([requests.map(({ domain, version }) => `${domain}@${version}`)])
      expect(versions.get('openjdk.org')).toBe('17.0.20.8')
    }
  })

  it('rejects conflicting explicit versions before invoking the native installer', async () => {
    let called = false
    await expect(installResolvedSystemPackages([
      { domain: 'openjdk.org', version: '17.0.20.8' },
      { domain: 'openjdk.org', version: '27.0.0.35' },
    ], { installDir: '/unused', nativeInstall: async () => {
      called = true
      return 0
    } })).rejects.toThrow('Conflicting required versions for openjdk.org')
    expect(called).toBe(false)
  })

  it('installs Unix Git through the native resolver and returns its exact version', async () => {
    const requests: string[] = []
    const version = await installResolvedSystemPackage('git-scm.org', '2.53.0', {
      installDir: '/unused', platform: { os: 'linux', arch: 'x86_64' },
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
      installDir: '/unused', platform: { os: 'linux', arch: 'x86_64' }, nativeInstall: async () => { throw new Error('A required library is unavailable') },
    })).rejects.toThrow('A required library is unavailable')
  })
})
