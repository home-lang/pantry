import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { checkAndMaybeUpdate, getGlobalPaths, isMarkerStale, writeUpdateNotice } from './update-check'

function mkdtemp(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lp-upd-'))
  return dir
}

function touch(p: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, new Date().toISOString())
}

function mtime(p: string): number | null {
  try {
    return fs.statSync(p).mtimeMs
  }
  catch {
    return null
  }
}

describe('update-check utils', () => {
  test('isMarkerStale returns true when no mtime', () => {
    const now = Date.now()
    expect(isMarkerStale(null, now, 24)).toBeTrue()
  })

  test('isMarkerStale respects TTL', () => {
    const now = Date.now()
    const ttlHours = 1
    const oneHourMs = 60 * 60 * 1000
    expect(isMarkerStale(now - oneHourMs + 1, now, ttlHours)).toBeFalse()
    expect(isMarkerStale(now - oneHourMs - 1, now, ttlHours)).toBeTrue()
  })

  test('writeUpdateNotice creates a readable notice file', () => {
    const tmpHome = mkdtemp()
    const { updateNotice } = getGlobalPaths(tmpHome)
    const pkgs = ['bun@1.2.21', 'deno@2.0.1']
    writeUpdateNotice(updateNotice, pkgs)
    const content = fs.readFileSync(updateNotice, 'utf8')
    expect(content).toContain('Updated 2 global package(s)')
    expect(content).toContain('• bun@1.2.21')
    expect(content).toContain('• deno@2.0.1')
  })
})

describe('checkAndMaybeUpdate (dryRun) with TTL + backoff', () => {
  const oldHome = process.env.LAUNCHPAD_TEST_HOME
  const oldSkipNet = process.env.LAUNCHPAD_SKIP_NETWORK
  let home: string

  beforeEach(() => {
    home = mkdtemp()
    process.env.LAUNCHPAD_TEST_HOME = home
    process.env.LAUNCHPAD_SKIP_NETWORK = '1' // avoid network and package resolution
  })

  afterEach(() => {
    if (oldHome === undefined)
      delete process.env.LAUNCHPAD_TEST_HOME
    else process.env.LAUNCHPAD_TEST_HOME = oldHome

    if (oldSkipNet === undefined)
      delete process.env.LAUNCHPAD_SKIP_NETWORK
    else process.env.LAUNCHPAD_SKIP_NETWORK = oldSkipNet
  })

  test('skips check when ready marker is fresh within TTL', async () => {
    const { readyCacheMarker } = getGlobalPaths(home)
    touch(readyCacheMarker)

    // fresh marker: set recent mtime
    const now = new Date()
    fs.utimesSync(readyCacheMarker, now, now)

    const res = await checkAndMaybeUpdate({ ttlHours: 24, dryRun: true })
    expect(res.checked).toBeFalse()
    expect(res.outdated).toBe(0)
  })

  test('performs check when marker is stale and sets refresh marker', async () => {
    const { readyCacheMarker, refreshMarker, updateBackoffMarker } = getGlobalPaths(home)

    // create an old marker (48h ago)
    touch(readyCacheMarker)
    const old = new Date(Date.now() - 48 * 60 * 60 * 1000)
    fs.utimesSync(readyCacheMarker, old, old)

    const res = await checkAndMaybeUpdate({ ttlHours: 24, dryRun: true })

    expect(res.checked).toBeTrue()
    expect(fs.existsSync(refreshMarker)).toBeTrue()
    expect(fs.existsSync(updateBackoffMarker)).toBeTrue()

    // TTL refreshed: ready marker should be touched recently
    const m = mtime(readyCacheMarker)!
    expect(Date.now() - m < 5 * 60 * 1000).toBeTrue()
  })

  test('backoff prevents repeated checks within the window', async () => {
    const { readyCacheMarker, updateBackoffMarker } = getGlobalPaths(home)

    // stale marker
    touch(readyCacheMarker)
    const old = new Date(Date.now() - 48 * 60 * 60 * 1000)
    fs.utimesSync(readyCacheMarker, old, old)

    // first run sets backoff
    const first = await checkAndMaybeUpdate({ ttlHours: 24, dryRun: true })
    expect(first.checked).toBeTrue()

    // second run should be skipped due to backoff
    const second = await checkAndMaybeUpdate({ ttlHours: 24, dryRun: true })
    expect(second.checked).toBeFalse()

    expect(fs.existsSync(updateBackoffMarker)).toBeTrue()
  })
})
