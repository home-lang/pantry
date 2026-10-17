import { describe, expect, it } from 'bun:test'
import {
  compareInstallerVersionsDesc,
  normalizeInstallerVersion,
  parseInstallerConstraint,
  resolveInstallerConstraintFromCandidates,
  satisfiesInstallerConstraint,
  zigOriginVersions,
} from '../src/installer'

describe('installer version constraints', () => {
  it('maps canonical Zig build metadata to registry paths', () => {
    expect(normalizeInstallerVersion('ziglang.org', '0.17.0-dev.1441+d5181a9c9'))
      .toBe('0.17.0-dev.1441_d5181a9c9')
    expect(normalizeInstallerVersion('bun.sh', '1.3.14+build')).toBe('1.3.14+build')
  })

  it('preserves prerelease metadata while parsing', () => {
    expect(parseInstallerConstraint('^0.17.0-dev')).toEqual({ operator: '^', target: '0.17.0-dev' })
    expect(parseInstallerConstraint('>=0.17.0-dev.1417+20befa4e6')).toEqual({
      operator: '>=',
      target: '0.17.0-dev.1417+20befa4e6',
    })
    expect(parseInstallerConstraint('latest')).toBeNull()
  })

  it('selects the newest matching Zig development build', () => {
    const versions = [
      '0.16.0',
      '0.17.0-dev.131+73c51c142',
      '0.17.0-dev.1417_20befa4e6',
      '0.17.0-dev.1441_d5181a9c9',
    ]
    expect(resolveInstallerConstraintFromCandidates('^0.17.0-dev', versions)).toBe('0.17.0-dev.1441_d5181a9c9')
    expect([...versions].sort(compareInstallerVersionsDesc)[0]).toBe('0.17.0-dev.1441_d5181a9c9')
  })

  it('uses only live Zig origin builds published for the target platform', () => {
    const index = {
      master: {
        version: '0.17.0-dev.1770+8f9d34bca',
        'aarch64-macos': { tarball: 'https://ziglang.org/builds/live.tar.xz' },
      },
      '0.17.0-dev.1282+7779fba5b': {
        version: '0.17.0-dev.1282+7779fba5b',
        'x86_64-linux': { tarball: 'https://ziglang.org/builds/linux-only.tar.xz' },
      },
      '0.15.2': {
        'aarch64-macos': { tarball: 'https://ziglang.org/download/0.15.2/stable.tar.xz' },
      },
    }

    expect(zigOriginVersions(index, { os: 'darwin', arch: 'aarch64' })).toEqual([
      '0.17.0-dev.1770+8f9d34bca',
      '0.15.2',
    ])
  })

  it('keeps stable constraints separate from prereleases', () => {
    const stable = parseInstallerConstraint('^0.17.0')!
    const development = parseInstallerConstraint('^0.17.0-dev')!
    expect(satisfiesInstallerConstraint('0.17.0-dev.1441_d5181a9c9', stable)).toBe(false)
    expect(satisfiesInstallerConstraint('0.17.0-dev.1441_d5181a9c9', development)).toBe(true)
    expect(satisfiesInstallerConstraint('0.18.0-dev.1_deadbeef', development)).toBe(false)
  })

  it('implements caret boundaries for zero-major versions', () => {
    expect(resolveInstallerConstraintFromCandidates('^0', ['1.0.0', '0.27.0', '0.26.0'])).toBe('0.27.0')
    expect(resolveInstallerConstraintFromCandidates('^0.0', ['0.1.0', '0.0.9', '0.0.2'])).toBe('0.0.9')
    expect(resolveInstallerConstraintFromCandidates('^0.0.0', ['0.0.9', '0.0.0'])).toBe('0.0.0')
    expect(satisfiesInstallerConstraint('0.15.9', parseInstallerConstraint('^0.15.1')!)).toBe(true)
    expect(satisfiesInstallerConstraint('0.16.0', parseInstallerConstraint('^0.15.1')!)).toBe(false)
    expect(satisfiesInstallerConstraint('0.0.4', parseInstallerConstraint('^0.0.3')!)).toBe(false)
  })
})
