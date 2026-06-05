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

// 'unavailable' = a builder requested a version that does not exist upstream (no
// source tarball AND no prebuilt binary — every attempt 404'd). It is NOT a build
// failure: it is never counted as failed or built and never penalises coverage.
// These are stored separately (see UnavailableVersion) so the dashboard can
// surface phantom/requested-but-missing versions.
export type BuildState = 'building' | 'built' | 'failed' | 'unavailable'

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
  /** Where the build ran: 'github' | 'hetzner' | 'local' (for the host chip). */
  hostKind?: string
  /** A link for the host chip (e.g. the GitHub Actions run URL). */
  hostUrl?: string
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
  /** Platforms this package targets (recipe `platforms` constraint mapped to the
   *  4 build platforms; defaults to all 4 when unconstrained). A project is
   *  "complete" when its latest version is built on every supported platform —
   *  so a macOS-only package is complete with just its darwin binaries. */
  supportedPlatforms: string[]
  /** Newest version known from the catalog (may exceed latestVersion when a
   *  published package has an unbuilt newer release ⇒ update available). */
  newestVersion: string | null
  /** True when the package is published but a newer version exists than the
   *  newest one with binaries (i.e. an update is available to build). */
  hasUpdate: boolean
}

/**
 * A version a builder REQUESTED but that does not exist upstream — no source
 * tarball AND no prebuilt binary (every build attempt 404'd). Surfaced on the
 * dashboard so phantom/requested-but-missing versions are visible separately
 * from genuine build failures. De-duplicated by domain|version|platform.
 */
export interface UnavailableVersion {
  domain: string
  version: string
  platform: string
  /** The 404 URL / download-failure detail tail, if the builder reported one. */
  reason?: string
  /** Last time this exact (domain, version, platform) was reported unavailable. */
  lastSeen: number // epoch ms
}

/** One captured build-log line for a domain (shown in the per-package log panel). */
export interface BuildLogLine {
  ts: number
  platform: string
  state: BuildState
  text: string
}

const LOG_LIMIT = 400 // per-domain ring buffer of recent build-log lines (tail)
const MESSAGE_MAX = 2000 // cap a single message/error so the snapshot can't bloat
const MAX_LOG_DOMAINS = 400 // bound total memory: only keep logs for the most-recent N domains

const RECENT_LIMIT = 500
// A "building" event with no log activity for this long is treated as a dead
// worker (killed mid-build, OOM, crash) and pruned. Active builds stream log
// lines via recordLogs(), which refreshes the entry's ts — so a genuinely long
// compile stays "building" as long as it keeps producing output. Without that
// heartbeat a stale window lets zombie entries inflate "Building now". The sweep
// boxes are restarted often (provisioner churn) which SIGKILLs in-flight builds
// with no "failed" event, so the heartbeat backstop must be tight — 10 min keeps
// the count close to the ~15-20 genuinely-active workers.
const BUILDING_TTL_MS = 10 * 60 * 1000
const COVERAGE_TTL_MS = 15 * 60 * 1000

// Bound the persisted unavailable-versions list so a long-running grind can't grow
// it without limit: keep the most-recently-seen N entries per domain, and an
// overall hard cap across all domains.
const UNAVAILABLE_PER_DOMAIN = 50
const UNAVAILABLE_TOTAL_CAP = 5000

interface PersistedState {
  version: 1
  building: BuildEvent[]
  recent: BuildEvent[]
  queue: string[]
  /** Requested-but-missing versions (no source/binary upstream). Persisted. */
  unavailable?: UnavailableVersion[]
}

export class BuildStatusStore {
  private building = new Map<string, BuildEvent>() // key: domain|version|platform
  private recent: BuildEvent[] = [] // newest first
  private queue: string[] = [] // domains requested for rebuild (FIFO, deduped)
  // Requested-but-missing versions, de-duplicated by domain|version|platform.
  // Persisted; capped per-domain + overall. Reconciled (entry removed) when the
  // same domain@version later builds successfully.
  private unavailable = new Map<string, UnavailableVersion>()
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

  // domain -> platforms the package targets (recipe `platforms`, mapped to
  // BUILD_PLATFORMS). Absent ⇒ supports all four. Drives "complete".
  private supportedPlatforms = new Map<string, string[]>()

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

  /** Seed domain -> supported build platforms (recipe `platforms` constraint,
   *  already mapped to BUILD_PLATFORMS). Domains absent from the map support all
   *  four platforms. Drives the "complete" status + the Projects-Complete stat. */
  setSupportedPlatforms(map: Map<string, string[]>): void {
    this.supportedPlatforms = map
  }

  /** Recent build-log lines for a domain (newest last), for the log panel. */
  getLogs(domain: string): BuildLogLine[] {
    return [...(this.logs.get(domain) || [])]
  }

  /**
   * Append a batch of streamed build-output lines for a domain and notify live
   * subscribers, so an open log panel updates in real time while a build runs.
   */
  recordLogs(domain: string, platform: string, lines: string[]): void {
    if (!domain || !lines?.length)
      return
    const buf = this.touchLogBuf(domain)
    const ts = Date.now()
    for (const line of lines)
      buf.push({ ts, platform: platform || '', state: 'building', text: String(line).slice(0, MESSAGE_MAX) })
    if (buf.length > LOG_LIMIT)
      buf.splice(0, buf.length - LOG_LIMIT)
    // Heartbeat: streaming logs prove the build is alive, so refresh the ts of
    // its "building" entries. This keeps long-running compiles out of the stale
    // sweep (BUILDING_TTL_MS) while still letting dead workers expire.
    for (const [, e] of this.building) {
      if (e.domain === domain && (!platform || !e.platform || e.platform === platform))
        e.ts = ts
    }
    this.evictOldLogDomains()
    this.emit()
  }

  /** Get-or-create a domain's log buffer, moving it to the end of the Map so the
   *  eviction order is LRU (least-recently-touched domains drop first). */
  private touchLogBuf(domain: string): BuildLogLine[] {
    let buf = this.logs.get(domain)
    if (buf)
      this.logs.delete(domain) // re-insert to move to the end (most-recent)
    else
      buf = []
    this.logs.set(domain, buf)
    return buf
  }

  /** Append a captured log line to a domain's bounded ring buffer. */
  private appendLog(e: BuildEvent, text: string): void {
    if (!text)
      return
    const buf = this.touchLogBuf(e.domain)
    buf.push({ ts: e.ts, platform: e.platform, state: e.state, text: text.slice(0, MESSAGE_MAX) })
    if (buf.length > LOG_LIMIT)
      buf.splice(0, buf.length - LOG_LIMIT)
    this.evictOldLogDomains()
  }

  /** Bound total memory by keeping logs only for the most-recently-touched
   *  domains (Map preserves insertion order; evict from the front). */
  private evictOldLogDomains(): void {
    while (this.logs.size > MAX_LOG_DOMAINS) {
      const oldest = this.logs.keys().next().value
      if (oldest === undefined)
        break
      this.logs.delete(oldest)
    }
  }

  async load(): Promise<void> {
    const s = (await this.snapshot.load()) as PersistedState | null
    if (!s)
      return
    // Filter out any non-package junk that was persisted before ingest validation
    // existed (e.g. probe events) so a restart self-heals the dashboard data.
    this.building = new Map((s.building || []).filter(e => isValidPackageDomain(e?.domain)).map(e => [this.key(e), e]))
    this.recent = (s.recent || []).filter(e => isValidPackageDomain(e?.domain)).slice(0, RECENT_LIMIT)
    this.queue = (s.queue || []).filter(d => isValidPackageDomain(d))
    this.unavailable = new Map(
      (s.unavailable || [])
        .filter(u => u && isValidPackageDomain(u.domain) && u.version && u.platform)
        .map(u => [this.key(u), {
          domain: String(u.domain),
          version: String(u.version),
          platform: String(u.platform),
          reason: u.reason ? String(u.reason).slice(0, MESSAGE_MAX) : undefined,
          lastSeen: Number(u.lastSeen) || Date.now(),
        }]),
    )
    this.capUnavailable()
  }

  private key(e: { domain: string, version: string, platform: string }): string {
    return `${e.domain}|${e.version}|${e.platform}`
  }

  private captureState(): PersistedState {
    return {
      version: 1,
      building: [...this.building.values()],
      recent: this.recent.slice(0, RECENT_LIMIT),
      queue: this.queue,
      unavailable: [...this.unavailable.values()],
    }
  }

  /** Record a build event reported by a builder. */
  record(raw: Partial<BuildEvent>): BuildEvent | null {
    if (!raw.domain || !raw.platform || !raw.state)
      return null
    // Only accept real package domains. Every pantry domain is a hostname with a
    // TLD (bun.sh, crates.io/ripgrep, go.uber.org/mock/mockgen), so it must start
    // alphanumeric and contain a dot. This rejects test/probe junk (e.g.
    // "__auth_probe__") so the dashboard only ever shows accurate package data.
    if (!isValidPackageDomain(String(raw.domain)))
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
      hostKind: raw.hostKind ? String(raw.hostKind).slice(0, 16) : undefined,
      hostUrl: raw.hostUrl ? String(raw.hostUrl).slice(0, 300) : undefined,
    }
    const k = this.key(event)
    if (event.state === 'unavailable') {
      // A requested-but-missing version. It is NOT a build outcome: don't add it to
      // `recent` (so it never shows as failed/built, never becomes lastState) and
      // don't touch coverage. Just record/refresh it in the dedicated list.
      this.building.delete(k) // clear any stale "building" entry for this attempt
      this.recordUnavailable(event)
      this.appendLog(event, event.error || `${event.platform}: unavailable (no source upstream)`)
      this.snapshot.scheduleSave()
      this.emit()
      return event
    }
    if (event.state === 'building') {
      this.building.set(k, event)
    }
    else {
      this.building.delete(k)
      this.recent.unshift(event)
      if (this.recent.length > RECENT_LIMIT)
        this.recent.length = RECENT_LIMIT
      // A version that LATER becomes available must drop off the unavailable list:
      // reconcile every unavailable entry for this exact domain@version (any
      // platform) when it builds successfully.
      if (event.state === 'built' && event.version)
        this.reconcileUnavailable(event.domain, event.version)
      // Optimistically merge a SUCCESSFUL build into coverage so the package
      // doesn't flash "unbuilt" in the window between the `built` report and the
      // next S3 listing (the listing then reconciles it). Only `built`, never
      // `failed` — a failure must not look like coverage.
      if (event.state === 'built' && event.version) {
        let vers = this.coverage.get(event.domain)
        if (!vers) {
          vers = new Map()
          this.coverage.set(event.domain, vers)
        }
        let plats = vers.get(event.version)
        if (!plats) {
          plats = new Set()
          vers.set(event.version, plats)
        }
        plats.add(event.platform)
        this.coverageLastBuilt.set(event.domain, new Date().toISOString())
      }
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

  /** Insert/refresh a requested-but-missing version (deduped by domain|version|platform). */
  private recordUnavailable(event: BuildEvent): void {
    if (!event.version)
      return // a phantom version with no version string is meaningless
    const k = this.key(event)
    this.unavailable.set(k, {
      domain: event.domain,
      version: event.version,
      platform: event.platform,
      reason: event.error,
      lastSeen: event.ts,
    })
    this.capUnavailable()
  }

  /** Remove every unavailable entry for a domain@version (any platform) — called
   *  when that version later builds successfully, so it leaves the list. */
  private reconcileUnavailable(domain: string, version: string): void {
    let changed = false
    for (const [k, u] of this.unavailable) {
      if (u.domain === domain && u.version === version) {
        this.unavailable.delete(k)
        changed = true
      }
    }
    if (changed)
      this.snapshot.scheduleSave()
  }

  /** Enforce the per-domain + overall caps on the unavailable list (drop oldest). */
  private capUnavailable(): void {
    // Per-domain cap: keep the newest UNAVAILABLE_PER_DOMAIN entries per domain.
    const byDomain = new Map<string, UnavailableVersion[]>()
    for (const u of this.unavailable.values()) {
      let arr = byDomain.get(u.domain)
      if (!arr) {
        arr = []
        byDomain.set(u.domain, arr)
      }
      arr.push(u)
    }
    for (const [, arr] of byDomain) {
      if (arr.length <= UNAVAILABLE_PER_DOMAIN)
        continue
      arr.sort((a, b) => a.lastSeen - b.lastSeen) // oldest first
      for (const u of arr.slice(0, arr.length - UNAVAILABLE_PER_DOMAIN))
        this.unavailable.delete(this.key(u))
    }
    // Overall cap: if still too large, drop the globally-oldest entries.
    if (this.unavailable.size > UNAVAILABLE_TOTAL_CAP) {
      const all = [...this.unavailable.values()].sort((a, b) => a.lastSeen - b.lastSeen)
      for (const u of all.slice(0, this.unavailable.size - UNAVAILABLE_TOTAL_CAP))
        this.unavailable.delete(this.key(u))
    }
  }

  /** The requested-but-missing versions list (newest-seen first), for the API/UI. */
  getUnavailableVersions(): UnavailableVersion[] {
    return [...this.unavailable.values()].sort((a, b) => b.lastSeen - a.lastSeen)
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
      // Sanity guard: a transient/partial S3 listing (network hiccup, truncation)
      // would otherwise REPLACE good coverage with a much smaller map, spiking
      // "unbuilt" and dropping "complete" until the next refresh. If we already
      // have substantial coverage and the new listing collapsed to <50% of it,
      // treat it as bad and keep the existing coverage (just bump the timestamp
      // so we retry on the next TTL).
      if (this.coverage.size >= 50 && cov.size < this.coverage.size * 0.5) {
        this.coverageAt = Date.now()
        return
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
  async getPackages(): Promise<{ packages: PackageRow[], generatedAt: string, totals: { publishedVersions: number, publishedArtifacts: number } }> {
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
      // newest version the catalog knows about (vs `latest` = newest *published*)
      const newestVersion = (this.knownVersions.get(domain) || []).reduce<string | null>(
        (acc, v) => (acc === null || compareVersionLoose(v, acc) > 0 ? v : acc),
        null,
      )
      packages.push({
        domain,
        latestVersion: latest,
        platforms,
        lastBuilt: this.coverageLastBuilt.get(domain) || null,
        building: [...(buildingByDomain.get(domain) || [])],
        lastState: lastStateByDomain.get(domain),
        published,
        lastMessage: lastMessageByDomain.get(domain),
        supportedPlatforms: this.supportedPlatforms.get(domain) || [...BUILD_PLATFORMS],
        newestVersion: newestVersion ?? latest,
        hasUpdate: published && !!newestVersion && !!latest && compareVersionLoose(newestVersion, latest) > 0,
      })
    }
    packages.sort((a, b) => a.domain.localeCompare(b.domain))
    // Totals across ALL versions (not just the latest per package):
    // publishedVersions = COMPLETE versions — a (domain, version) where every
    //   platform the package supports has been uploaded (a partially-built version
    //   does NOT count; "everything for that version was uploaded").
    // publishedArtifacts = total per-platform binaries published.
    let publishedVersions = 0
    let publishedArtifacts = 0
    for (const [domain, versions] of this.coverage) {
      const supported = this.supportedPlatforms.get(domain) || [...BUILD_PLATFORMS]
      for (const plats of versions.values()) {
        if (plats.size === 0)
          continue
        publishedArtifacts += plats.size
        if (supported.length > 0 && supported.every(p => plats.has(p)))
          publishedVersions++
      }
    }
    return { packages, generatedAt: new Date().toISOString(), totals: { publishedVersions, publishedArtifacts } }
  }

  async flush(): Promise<void> {
    await this.snapshot.flush()
  }
}

/**
 * True for strings that look like a real pantry package domain: a hostname with
 * a TLD, optionally followed by a path (bun.sh, crates.io/ripgrep,
 * go.uber.org/mock/mockgen, people.engr.tamu.edu/davis/suitesparse). Must start
 * alphanumeric and contain at least one dot. Rejects test/probe junk like
 * "__auth_probe__" so build-status data stays accurate.
 */
export function isValidPackageDomain(d: unknown): boolean {
  if (typeof d !== 'string')
    return false
  const s = d.trim()
  if (s.length === 0 || s.length > 200)
    return false
  // Flat character classes (no nested quantifiers) to avoid catastrophic
  // backtracking: <alnum><host chars> "." <alnum> <host/path chars>.
  return /^[a-z0-9][a-z0-9.+-]*\.[a-z0-9][\w.+/-]*$/i.test(s)
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
