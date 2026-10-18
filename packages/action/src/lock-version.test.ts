import { describe, expect, test } from 'bun:test'
import {
  isRollingVersionSpec,
  normalizeLockedVersion,
  reassertVersionSpec,
  shouldUseLockedVersion,
  versionSatisfiesSpec,
} from './lock-version'

describe('versionSatisfiesSpec', () => {
  test('stable constraints never accept a prerelease with the same numeric core', () => {
    for (const spec of ['0.17.0', '=0.17.0', '^0.17.0', '~0.17.0', '>=0.17.0', '<0.18.0']) {
      expect(versionSatisfiesSpec('0.17.0-dev.1978+c961124d9', spec)).toBe(false)
      expect(versionSatisfiesSpec('0.17.0', spec)).toBe(true)
    }
  })

  test('explicit development ranges preserve build ordering', () => {
    expect(versionSatisfiesSpec('0.17.0-dev.1978+c961124d9', '>=0.17.0-dev.2000')).toBe(false)
    expect(versionSatisfiesSpec('0.17.0-dev.2384+ac77c23af', '>=0.17.0-dev.2000')).toBe(true)
  })

  test('supports sentinels, exact versions, and common ranges', () => {
    expect(versionSatisfiesSpec('1.3.14', '*')).toBe(true)
    expect(versionSatisfiesSpec('1.3.14', '^1.3.10')).toBe(true)
    expect(versionSatisfiesSpec('2.0.0', '^1.3.10')).toBe(false)
    expect(versionSatisfiesSpec('0.15.15', '~0.15.10')).toBe(true)
    expect(versionSatisfiesSpec('0.16.0', '~0.15.10')).toBe(false)
    expect(versionSatisfiesSpec(
      '0.17.0-dev.956+2dca73595',
      '0.17.0-dev.1413+addc3c3b8',
    )).toBe(false)
  })
})

describe('shouldUseLockedVersion', () => {
  test('a filesystem-encoded development lock cannot override a stable Zig pin', () => {
    expect(shouldUseLockedVersion('ziglang.org', '0.17.0-dev.1978_c961124d9', '0.17.0', [
      '0.17.0-dev.1978+c961124d9', '0.17.0',
    ])).toBe(false)
    expect(shouldUseLockedVersion('ziglang.org', '0.17.0', '0.17.0')).toBe(true)
  })

  test('does not freeze a rolling Zig development channel when availability is unknown', () => {
    expect(shouldUseLockedVersion(
      'ziglang.org',
      '0.17.0-dev.131+73c51c142',
      '0.17.0-dev',
    )).toBe(false)
  })

  test('keeps a rolling pin the registry still publishes', () => {
    // Every dev build published in a week otherwise invalidates the cached
    // toolchain on every runner, at ~89 MB of object-storage egress a job.
    expect(shouldUseLockedVersion(
      'ziglang.org',
      '0.17.0-dev.1503+1f1bee62e',
      '0.17.0-dev',
      ['0.17.0-dev.1503+1f1bee62e', '0.17.0-dev.1567+f0354179a'],
    )).toBe(true)
  })

  test('re-resolves a rolling pin the registry has dropped', () => {
    expect(shouldUseLockedVersion(
      'ziglang.org',
      '0.17.0-dev.131+73c51c142',
      '0.17.0-dev',
      ['0.17.0-dev.1567+f0354179a'],
    )).toBe(false)
  })

  test('rejects a rolling pin from a different channel', () => {
    expect(shouldUseLockedVersion(
      'ziglang.org',
      '0.16.0-dev.2984+cb7d2b056',
      '0.17.0-dev',
      ['0.16.0-dev.2984+cb7d2b056'],
    )).toBe(false)
  })

  test('accepts a rolling pin stored in lockfile spelling', () => {
    expect(shouldUseLockedVersion(
      'ziglang.org',
      '0.17.0-dev.1503_1f1bee62e',
      '0.17.0-dev',
      ['0.17.0-dev.1503+1f1bee62e'],
    )).toBe(true)
  })

  test('preserves exact Zig development pins and ordinary lock entries', () => {
    expect(shouldUseLockedVersion(
      'ziglang.org',
      '0.17.0-dev.956+2dca73595',
      '0.17.0-dev.956+2dca73595',
    )).toBe(true)
    expect(shouldUseLockedVersion('bun.sh', '1.3.14', '^1.3.10')).toBe(true)
  })

  test('matches filesystem-safe Zig metadata to its canonical exact pin', () => {
    expect(normalizeLockedVersion(
      'ziglang.org',
      '0.17.0-dev.1465_8b2d0ce21',
    )).toBe('0.17.0-dev.1465+8b2d0ce21')
    expect(shouldUseLockedVersion(
      'ziglang.org',
      '0.17.0-dev.1465_8b2d0ce21',
      '0.17.0-dev.1465+8b2d0ce21',
    )).toBe(true)
    expect(normalizeLockedVersion('example.com', '1.0.0_build')).toBe('1.0.0_build')
  })

  test('matches filesystem-safe Zig metadata on both sides', () => {
    expect(shouldUseLockedVersion(
      'ziglang.org',
      '0.17.0-dev.1509_bb296ab9b',
      '0.17.0-dev.1509_bb296ab9b',
    )).toBe(true)
  })
})

describe('isRollingVersionSpec', () => {
  test('only classifies short Zig development channels as rolling', () => {
    expect(isRollingVersionSpec('ziglang.org', '0.17.0-dev')).toBe(true)
    expect(isRollingVersionSpec('ziglang.org', '0.17.0-dev.1413+addc3c3b8')).toBe(false)
    expect(isRollingVersionSpec('bun.sh', '0.17.0-dev')).toBe(false)
  })
})

describe('reassertVersionSpec', () => {
  test('reuses the concrete result of a rolling Zig install', () => {
    const resolved = new Map([
      ['ziglang.org', '0.17.0-dev.1476+91a29d707'],
    ])
    expect(reassertVersionSpec('ziglang.org', '0.17.0-dev', resolved))
      .toBe('0.17.0-dev.1476+91a29d707')
    expect(reassertVersionSpec('bun.sh', '1.3.14', resolved)).toBe('1.3.14')
  })
})
