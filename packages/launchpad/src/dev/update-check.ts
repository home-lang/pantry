import fs from 'node:fs'
import { homedir as osHomedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { getLatestVersion } from '../install'
import { list } from '../list'

const HOUR_MS = 60 * 60 * 1000
const DEFAULT_TTL_HOURS = 24
const DEFAULT_BACKOFF_MINUTES = 60

export function resolveHomedir(): string {
  // Allow tests to override home directory
  return process.env.LAUNCHPAD_TEST_HOME || osHomedir()
}

export function getGlobalPaths(home: string = resolveHomedir()): {
  cacheDir: string
  shellCacheDir: string
  readyCacheMarker: string
  globalDir: string
  readyGlobalMarker: string
  refreshMarker: string
  updateBackoffMarker: string
  updateNotice: string
} {
  const cacheDir = path.join(home, '.cache', 'launchpad')
  const shellCacheDir = path.join(cacheDir, 'shell_cache')
  const readyCacheMarker = path.join(cacheDir, 'global_ready')
  const globalDir = path.join(home, '.local', 'share', 'launchpad', 'global')
  const readyGlobalMarker = path.join(globalDir, '.ready')
  const refreshMarker = path.join(shellCacheDir, 'global_refresh_needed')
  const updateBackoffMarker = path.join(shellCacheDir, 'update_check_backoff')
  const updateNotice = path.join(shellCacheDir, 'global_update_notice')
  return { cacheDir, shellCacheDir, readyCacheMarker, globalDir, readyGlobalMarker, refreshMarker, updateBackoffMarker, updateNotice }
}

export function isMarkerStale(markerMtimeMs: number | null, nowMs: number, ttlHours: number = DEFAULT_TTL_HOURS): boolean {
  if (!markerMtimeMs)
    return true
  const ttlMs = ttlHours * HOUR_MS
  return nowMs - markerMtimeMs > ttlMs
}

function getMtimeMs(file: string): number | null {
  try {
    const st = fs.statSync(file)
    return st.mtimeMs
  }
  catch {
    return null
  }
}

function touchFile(file: string): void {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, new Date().toISOString())
  }
  catch {
    // ignore
  }
}

export function writeUpdateNotice(updateNoticePath: string, pkgs: string[]): void {
  try {
    fs.mkdirSync(path.dirname(updateNoticePath), { recursive: true })
    const lines = [
      `✅ Updated ${pkgs.length} global package(s):`,
      ...pkgs.map(p => `  • ${p}`),
      'Tip: set LAUNCHPAD_AUTO_UPDATE_GLOBALS=1 to enable/disable auto updates.',
    ]
    fs.writeFileSync(updateNoticePath, `${lines.join('\n')}\n`)
  }
  catch {
    // ignore
  }
}

function withinBackoff(file: string, minutes = DEFAULT_BACKOFF_MINUTES, nowMs = Date.now()): boolean {
  const mtime = getMtimeMs(file)
  if (!mtime)
    return false
  const backoffMs = minutes * 60 * 1000
  return nowMs - mtime < backoffMs
}

export async function computeOutdatedGlobals(installPath: string): Promise<Array<{ name: string, currentVersion: string, latestVersion: string }>> {
  const installed = await list(installPath)
  const updates: Array<{ name: string, currentVersion: string, latestVersion: string }> = []
  for (const pkg of installed) {
    const latest = getLatestVersion(pkg.project)
    if (!latest)
      continue
    const current = pkg.version.toString()
    if (current !== latest) {
      updates.push({ name: pkg.project, currentVersion: current, latestVersion: latest })
    }
  }
  return updates
}

export async function checkAndMaybeUpdate(options?: { ttlHours?: number, autoUpdate?: boolean, dryRun?: boolean }): Promise<{ checked: boolean, outdated: number }> {
  const home = resolveHomedir()
  const { readyCacheMarker, readyGlobalMarker, refreshMarker, updateBackoffMarker, globalDir, updateNotice } = getGlobalPaths(home)

  // TTL
  const ttlHours = options?.ttlHours ?? Number.parseInt(process.env.LAUNCHPAD_GLOBAL_UPDATE_TTL_HOURS || String(DEFAULT_TTL_HOURS), 10)

  // Check staleness
  const now = Date.now()
  const mtimeA = getMtimeMs(readyCacheMarker)
  const mtimeB = getMtimeMs(readyGlobalMarker)
  const newest = Math.max(mtimeA ?? 0, mtimeB ?? 0) || null
  if (!isMarkerStale(newest, now, ttlHours)) {
    return { checked: false, outdated: 0 }
  }

  // Backoff
  if (withinBackoff(updateBackoffMarker, DEFAULT_BACKOFF_MINUTES, now)) {
    return { checked: false, outdated: 0 }
  }

  // Mark we attempted a check
  touchFile(updateBackoffMarker)

  // In tests or when network should be skipped, just touch refresh marker and return
  if (options?.dryRun || process.env.LAUNCHPAD_SKIP_NETWORK === '1') {
    touchFile(refreshMarker)
    touchFile(readyCacheMarker) // refresh TTL
    return { checked: true, outdated: 0 }
  }

  // Compute outdated
  let outdated = 0
  try {
    const updates = await computeOutdatedGlobals(globalDir)
    outdated = updates.length

    if (outdated > 0) {
      // Signal shell to refresh command cache
      touchFile(refreshMarker)

      const autoUpdate = options?.autoUpdate ?? (process.env.LAUNCHPAD_AUTO_UPDATE_GLOBALS === '1')
      if (autoUpdate) {
        // Import install and perform updates
        const { install } = await import('../install')
        const pkgs = updates.map(u => `${u.name}@${u.latestVersion}`)
        if (config.verbose) {
          console.warn(`🔄 Auto-updating ${pkgs.length} global package(s): ${pkgs.join(', ')}`)
        }
        try {
          await install(pkgs, globalDir)
          // Write user-facing notice for shell to display once
          writeUpdateNotice(updateNotice, pkgs)
        }
        catch (err) {
          if (config.verbose)
            console.warn('Warning: auto-update failed', err)
        }
      }
    }
  }
  catch (err) {
    if (config.verbose)
      console.warn('Warning: global update check failed', err)
  }

  // Refresh TTL regardless to avoid re-checking too frequently
  touchFile(readyCacheMarker)

  return { checked: true, outdated }
}
