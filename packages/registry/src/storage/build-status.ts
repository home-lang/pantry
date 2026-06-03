import type { S3Client } from './aws-client'
import { ObjectSnapshot } from './object-snapshot'

/**
 * Tracks package build activity for the pantry.dev build dashboard:
 *   - which packages are building RIGHT NOW (live, reported by builders)
 *   - a recent history of build outcomes (built / failed)
 *   - a manual-rebuild request queue (drained by the build-driver)
 *   - per-platform coverage, derived by listing the binaries/ prefix
 *
 * Builders (build-package.ts, used by CI / the hetzner driver / the local Mac
 * build) POST events to /api/build-events; this store keeps the model in memory
 * and persists the live/recent/queue parts as one JSON object (same pattern as
 * the other object-backed stores). Coverage is derived/cached, not persisted.
 */
export const BUILD_PLATFORMS = ['darwin-arm64', 'darwin-x86-64', 'linux-x86-64', 'linux-arm64'] as const
export type BuildPlatform = typeof BUILD_PLATFORMS[number]
const PLATFORM_SET = new Set<string>(BUILD_PLATFORMS)

export type BuildState = 'building' | 'built' | 'failed'

export interface BuildEvent {
  domain: string
  version: string
  platform: string
  state: BuildState
  host?: string
  ts: number
  /** Optional progress line (for `building`) — a human-readable step. */
  message?: string
  /** Optional failure detail (for `failed`) — the error/output tail. */
  error?: string
}

export interface PackageRow {
  domain: string
  latestVersion: string | null
  platforms: Record<string, boolean> // platform -> present in latest version
  lastBuilt: string | null // ISO
  building: string[] // platforms currently building (live)
  lastState?: BuildState // most recent reported outcome
  /** True when the package has at least one published binary. */
  published: boolean
  /** Latest message (building progress) or error (failed) for inline display. */
  lastMessage?: string
}

/** One captured build-log line for a domain (shown in the per-package log panel). */
export interface BuildLogLine {
  ts: number
  platform: string
  state: BuildState
  text: string
}

const LOG_LIMIT = 200 // per-domain ring buffer of recent build-log lines
const MESSAGE_MAX = 2000 // cap a single message/error so the snapshot can't bloat

const RECENT_LIMIT = 500
const BUILDING_TTL_MS = 60 * 60 * 1000 // a "building" event older than 1h is considered stale
const COVERAGE_TTL_MS = 15 * 60 * 1000

interface PersistedState {
  version: 1
  building: BuildEvent[]
  recent: BuildEvent[]
  queue: string[]
}

export class BuildStatusStore {
  private building = new Map<string, BuildEvent>() // key: domain|version|platform
  private recent: BuildEvent[] = [] // newest first
  private queue: string[] = [] // domains requested for rebuild (FIFO, deduped)
  private snapshot: ObjectSnapshot

  // Derived coverage cache (domain -> version -> set of platforms) + freshness.
  private coverage = new Map<string, Map<string, Set<string>>>()
  private coverageLastBuilt = new Map<string, string>()
  private coverageAt = 0
  private coveragePromise: Promise<void> | null = null

  // Live subscribers (SSE connections on /api/build-events-stream). Each is
  // notified with a fresh status snapshot whenever build activity changes.
  private subscribers = new Set<(status: ReturnType<BuildStatusStore['getStatus']>) => void>()

  // Full known-package catalog (domain -> versions), so the table lists every
  // package — including those not yet built — not just ones with binaries.
  private knownVersions = new Map<string, string[]>()

  // Per-domain ring buffer of recent build-log lines (in-memory only; not
  // persisted — these are live build diagnostics, capped per domain).
  private logs = new Map<string, BuildLogLine[]>()

  constructor(private s3: S3Client, private bucket: string) {
    this.snapshot = new ObjectSnapshot(s3, bucket, 'build-status/status.json', () => this.captureState())
  }

  /**
   * Subscribe to live status changes (used by the SSE endpoint). The callback
   * fires with a full status snapshot on every change. Returns an unsubscribe fn.
   */
  subscribe(cb: (status: ReturnType<BuildStatusStore['getStatus']>) => void): () => void {
    this.subscribers.add(cb)
    return () => { this.subscribers.delete(cb) }
  }

  /** Push the current status to all live subscribers (best-effort, never throws). */
  private emit(): void {
    if (this.subscribers.size === 0)
      return
    const status = this.getStatus()
    for (const cb of this.subscribers) {
      try { cb(status) }
      catch { /* a broken subscriber must not affect others or the caller */ }
    }
  }

  /** Number of live SSE subscribers (for diagnostics). */
  get subscriberCount(): number {
    return this.subscribers.size
  }

  /**
   * Seed the full package catalog (domain -> versions, newest-first or any
   * order). Lets getPackages() list packages that have no binaries yet, so the
   * dashboard shows the whole catalog and what's still to be built.
   */
  setKnownPackages(map: Map<string, string[]>): void {
    this.knownVersions = map
  }

  /** Recent build-log lines for a domain (newest last), for the log panel. */
  getLogs(domain: string): BuildLogLine[] {
    return [...(this.logs.get(domain) || [])]
  }

  /** Append a captured log line to a domain's bounded ring buffer. */
  private appendLog(e: BuildEvent, text: string): void {
    if (!text)
      return
    let buf = this.logs.get(e.domain)
    if (!buf) {
      buf = []
      this.logs.set(e.domain, buf)
    }
    buf.push({ ts: e.ts, platform: e.platform, state: e.state, text: text.slice(0, MESSAGE_MAX) })
    if (buf.length > LOG_LIMIT)
      buf.splice(0, buf.length - LOG_LIMIT)
  }

  async load(): Promise<void> {
    const s = (await this.snapshot.load()) as PersistedState | null
    if (!s)
      return
    this.building = new Map((s.building || []).map(e => [this.key(e), e]))
    this.recent = (s.recent || []).slice(0, RECENT_LIMIT)
    this.queue = s.queue || []
  }

  private key(e: { domain: string, version: string, platform: string }): string {
    return `${e.domain}|${e.version}|${e.platform}`
  }

  private captureState(): PersistedState {
    return { version: 1, building: [...this.building.values()], recent: this.recent.slice(0, RECENT_LIMIT), queue: this.queue }
  }

  /** Record a build event reported by a builder. */
  record(raw: Partial<BuildEvent>): BuildEvent | null {
    if (!raw.domain || !raw.platform || !raw.state)
      return null
    const event: BuildEvent = {
      domain: String(raw.domain),
      version: String(raw.version || ''),
      platform: String(raw.platform),
      state: raw.state,
      host: raw.host ? String(raw.host).slice(0, 64) : undefined,
      ts: Date.now(),
      message: raw.message ? String(raw.message).slice(0, MESSAGE_MAX) : undefined,
      error: raw.error ? String(raw.error).slice(0, MESSAGE_MAX) : undefined,
    }
    const k = this.key(event)
    if (event.state === 'building') {
      this.building.set(k, event)
    }
    else {
      this.building.delete(k)
      this.recent.unshift(event)
      if (this.recent.length > RECENT_LIMIT)
        this.recent.length = RECENT_LIMIT
      // A finished build changes coverage for this domain — invalidate cache.
      this.coverageAt = 0
    }
    // Capture any progress/error text into the domain's log buffer so the UI
    // can stream it (state transitions are always logged; messages/errors too).
    this.appendLog(event, event.error || event.message || `${event.platform}: ${event.state}`)
    this.snapshot.scheduleSave()
    this.emit()
    return event
  }

  /** Drop stale "building" entries (builder died without reporting completion). */
  private pruneStaleBuilding(): void {
    const cutoff = Date.now() - BUILDING_TTL_MS
    let changed = false
    for (const [k, e] of this.building) {
      if (e.ts < cutoff) {
        this.building.delete(k)
        changed = true
      }
    }
    if (changed)
      this.snapshot.scheduleSave()
  }

  requestRebuild(domain: string): boolean {
    const d = String(domain || '').trim()
    if (!d || this.queue.includes(d))
      return false
    this.queue.push(d)
    this.snapshot.scheduleSave()
    this.emit()
    return true
  }

  getQueue(): string[] {
    return [...this.queue]
  }

  /** Remove domains from the queue (called once a build run has claimed them). */
  clearQueue(domains?: string[]): void {
    if (!domains) {
      this.queue = []
    }
    else {
      const drop = new Set(domains)
      this.queue = this.queue.filter(d => !drop.has(d))
    }
    this.snapshot.scheduleSave()
    this.emit()
  }

  getStatus(): { building: BuildEvent[], recent: BuildEvent[], queue: string[] } {
    this.pruneStaleBuilding()
    return {
      building: [...this.building.values()].sort((a, b) => b.ts - a.ts),
      recent: this.recent.slice(0, 100),
      queue: [...this.queue],
    }
  }

  /** Parse an object key binaries/<domain>/<version>/<platform>/<file> right-to-left. */
  private parseKey(key: string): { domain: string, version: string, platform: string } | null {
    const parts = key.split('/')
    if (parts.length < 5 || parts[0] !== 'binaries')
      return null
    const platform = parts[parts.length - 2]
    if (!PLATFORM_SET.has(platform))
      return null // skip metadata.json and other non-artifact keys
    const version = parts[parts.length - 3]
    const domain = parts.slice(1, parts.length - 3).join('/')
    if (!domain || !version)
      return null
    return { domain, version, platform }
  }

  /** Rebuild the coverage cache by listing the binaries/ prefix. */
  async refreshCoverage(force = false): Promise<void> {
    if (!force && Date.now() - this.coverageAt < COVERAGE_TTL_MS)
      return
    if (this.coveragePromise)
      return this.coveragePromise
    this.coveragePromise = (async () => {
      const objects = await this.s3.list({ bucket: this.bucket, prefix: 'binaries/', maxKeys: 1_000_000 })
      const cov = new Map<string, Map<string, Set<string>>>()
      const lastBuilt = new Map<string, string>()
      for (const obj of objects) {
        const parsed = this.parseKey(obj.Key)
        if (!parsed)
          continue
        const { domain, version, platform } = parsed
        let versions = cov.get(domain)
        if (!versions) {
          versions = new Map()
          cov.set(domain, versions)
        }
        let plats = versions.get(version)
        if (!plats) {
          plats = new Set()
          versions.set(version, plats)
        }
        plats.add(platform)
        if (obj.LastModified && (!lastBuilt.has(domain) || obj.LastModified > lastBuilt.get(domain)!))
          lastBuilt.set(domain, obj.LastModified)
      }
      this.coverage = cov
      this.coverageLastBuilt = lastBuilt
      this.coverageAt = Date.now()
    })().finally(() => { this.coveragePromise = null })
    return this.coveragePromise
  }

  private latestVersion(versions: Map<string, Set<string>>): string | null {
    let latest: string | null = null
    for (const v of versions.keys()) {
      if (latest === null || compareVersionLoose(v, latest) > 0)
        latest = v
    }
    return latest
  }

  /** The full package table: coverage merged with live building state. */
  async getPackages(): Promise<{ packages: PackageRow[], generatedAt: string }> {
    // Stale-while-revalidate: only block on a completely cold cache (first call
    // before the boot-seed lands). When merely stale, refresh in the background
    // so the request never waits on the full binaries/ listing.
    if (this.coverage.size === 0)
      await this.refreshCoverage(true)
    else if (Date.now() - this.coverageAt > COVERAGE_TTL_MS)
      void this.refreshCoverage()
    this.pruneStaleBuilding()
    // building: domain -> set of platforms currently building
    const buildingByDomain = new Map<string, Set<string>>()
    for (const e of this.building.values()) {
      let s = buildingByDomain.get(e.domain)
      if (!s) {
        s = new Set()
        buildingByDomain.set(e.domain, s)
      }
      s.add(e.platform)
    }
    // last reported outcome + latest message/error per domain
    const lastStateByDomain = new Map<string, BuildState>()
    const lastMessageByDomain = new Map<string, string>()
    for (const e of this.recent) {
      if (!lastStateByDomain.has(e.domain)) {
        lastStateByDomain.set(e.domain, e.state)
        const m = e.error || e.message
        if (m)
          lastMessageByDomain.set(e.domain, m)
      }
    }
    // live building progress messages take precedence for inline display
    for (const e of this.building.values()) {
      if (e.message)
        lastMessageByDomain.set(e.domain, e.message)
    }

    // The package universe = published (have binaries) ∪ currently building ∪
    // recently-reported (so a failed first build is still visible) ∪ the full
    // known catalog, so nothing is hidden just because it lacks a binary.
    const domains = new Set<string>([
      ...this.coverage.keys(),
      ...buildingByDomain.keys(),
      ...lastStateByDomain.keys(),
      ...this.knownVersions.keys(),
    ])
    const packages: PackageRow[] = []
    for (const domain of domains) {
      const versions = this.coverage.get(domain)
      const published = !!versions && versions.size > 0
      const latest = versions
        ? this.latestVersion(versions)
        : (this.knownVersions.get(domain) || []).reduce<string | null>(
            (acc, v) => (acc === null || compareVersionLoose(v, acc) > 0 ? v : acc),
            null,
          )
      const latestPlats = latest && versions ? versions.get(latest) ?? new Set<string>() : new Set<string>()
      const platforms: Record<string, boolean> = {}
      for (const p of BUILD_PLATFORMS)
        platforms[p] = latestPlats.has(p)
      packages.push({
        domain,
        latestVersion: latest,
        platforms,
        lastBuilt: this.coverageLastBuilt.get(domain) || null,
        building: [...(buildingByDomain.get(domain) || [])],
        lastState: lastStateByDomain.get(domain),
        published,
        lastMessage: lastMessageByDomain.get(domain),
      })
    }
    packages.sort((a, b) => a.domain.localeCompare(b.domain))
    return { packages, generatedAt: new Date().toISOString() }
  }

  async flush(): Promise<void> {
    await this.snapshot.flush()
  }
}

/** Loose version compare: numeric-aware, good enough for picking a "latest". */
export function compareVersionLoose(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split(/[.\-+]/)
  const pb = b.replace(/^v/, '').split(/[.\-+]/)
  const n = Math.max(pa.length, pb.length)
  for (let i = 0; i < n; i++) {
    const na = Number.parseInt(pa[i] ?? '0', 10)
    const nb = Number.parseInt(pb[i] ?? '0', 10)
    if (Number.isNaN(na) || Number.isNaN(nb)) {
      const c = (pa[i] ?? '').localeCompare(pb[i] ?? '')
      if (c !== 0)
        return c
    }
    else if (na !== nb) {
      return na - nb
    }
  }
  return 0
}
