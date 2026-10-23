/**
 * Bytes the registry has handed out, bucketed by day.
 *
 * Host network counters cannot answer this. Artifact downloads are a redirect
 * to object storage (or to a CDN in front of it), so the bytes never traverse
 * the registry's NIC — the box can be idle while the bucket serves terabytes.
 * The only component that knows a download happened *and* how large it was is
 * the registry, at the moment it authorizes the redirect.
 *
 * So this records the artifact's declared size against the day GET authorized it.
 * This is an estimate of client download bytes, not provider billing, and makes
 * "are we on track to exceed the monthly allowance?" answerable before the
 * allowance is gone rather than after.
 *
 * Caveats worth knowing when reading the numbers: this counts bytes we
 * authorized, not bytes that completed, so an abandoned download still counts;
 * once a CDN is in front of the bucket it counts client-side downloads rather
 * than cache misses; direct bucket reads and scanner/CI transfers bypass it.
 * HEAD probes must not be recorded, since they transfer no artifact body.
 */

/** Days of history to keep. Two months, so a full month is always comparable. */
const RETENTION_DAYS = 62
const MAX_PACKAGES_PER_DAY = 512

export interface EgressPackage {
  packageName: string
  bytes: number
  downloads: number
}

export interface EgressDay {
  date: string
  bytes: number
  downloads: number
  packages?: EgressPackage[]
}

export interface EgressSnapshot {
  measurement: 'authorized-get-bytes'
  /** UTC day key the `today` figures belong to. */
  today: string
  todayBytes: number
  todayDownloads: number
  /** UTC month key (YYYY-MM) the month-to-date figures belong to. */
  month: string
  monthBytes: number
  monthDownloads: number
  /** Configured monthly allowance in bytes, or 0 when none is set. */
  budgetBytes: number
  /** Share of the allowance consumed, or null without an allowance. */
  budgetUsedPercent: number | null
  /** Straight-line month-end projection from the month-to-date rate. */
  projectedMonthBytes: number
  /** First retained day in this month; a partial month must not imply full coverage. */
  observedSince: string | null
  observedDays: number
  /** Only attributed GETs; historical totals can include unattributed requests. */
  topPackages: EgressPackage[]
  /** Newest last. */
  days: EgressDay[]
}

function dayKey(at: number): string {
  return new Date(at).toISOString().slice(0, 10)
}

function monthKey(at: number): string {
  return new Date(at).toISOString().slice(0, 7)
}

/**
 * Providers quote allowances in decimal TB ("5.0 TB included") and bill overage
 * per decimal TB. Using binary units here would understate usage against the
 * allowance by about 10% — precisely the margin a surprise invoice hides in.
 */
export function egressBudgetBytes(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.PANTRY_EGRESS_BUDGET_TB
  if (!raw)
    return 0
  const tb = Number.parseFloat(raw)
  return Number.isFinite(tb) && tb > 0 ? Math.round(tb * 1000 ** 4) : 0
}

/**
 * How often the ledger asks to be persisted, at most.
 *
 * Every download mutates it, so persisting on each one would turn a busy
 * minute into hundreds of object writes — billable operations on every
 * provider, and pointless when the reader only ever asks for day granularity.
 * Losing up to a minute of counts to an unclean shutdown is the right trade.
 */
const PERSIST_INTERVAL_MS = 60_000

export class EgressLedger {
  private days = new Map<string, EgressDay>()
  private persist?: () => void
  private lastPersistAt = 0

  constructor(
    private readonly now: () => number = Date.now,
    private readonly budget: () => number = () => egressBudgetBytes(),
  ) {}

  /** Register the persistence hook; called at most once per interval. */
  persistWith(save: () => void): void {
    this.persist = save
  }

  /** Charge a served artifact to today's bucket. */
  record(bytes: number, packageName?: string): void {
    const size = Number(bytes)
    if (!Number.isFinite(size) || size < 0)
      return
    const now = this.now()
    const key = dayKey(now)
    const day = this.days.get(key) || { date: key, bytes: 0, downloads: 0 }
    day.bytes += size
    day.downloads += 1
    if (packageName) {
      day.packages ??= []
      let entry = day.packages.find(item => item.packageName === packageName)
      if (!entry) {
        const name = day.packages.length < MAX_PACKAGES_PER_DAY ? packageName : '(other)'
        entry = day.packages.find(item => item.packageName === name)
        if (!entry) {
          entry = { packageName: name, bytes: 0, downloads: 0 }
          day.packages.push(entry)
        }
      }
      entry.bytes += size
      entry.downloads += 1
    }
    this.days.set(key, day)
    this.prune()
    if (this.persist && now - this.lastPersistAt >= PERSIST_INTERVAL_MS) {
      this.lastPersistAt = now
      this.persist()
    }
  }

  snapshot(): EgressSnapshot {
    const at = this.now()
    const today = dayKey(at)
    const month = monthKey(at)
    const days = [...this.days.values()].sort((a, b) => a.date.localeCompare(b.date))
    const todayDay = this.days.get(today)
    const monthDays = days.filter(day => day.date.startsWith(month))
    const monthBytes = monthDays.reduce((total, day) => total + day.bytes, 0)
    const budgetBytes = this.budget()
    const packages = new Map<string, EgressPackage>()
    for (const day of monthDays) {
      for (const item of day.packages || []) {
        const entry = packages.get(item.packageName) || { packageName: item.packageName, bytes: 0, downloads: 0 }
        entry.bytes += item.bytes
        entry.downloads += item.downloads
        packages.set(item.packageName, entry)
      }
    }

    // Project from elapsed days rather than elapsed time: the ledger is
    // day-bucketed, so a partial first day would otherwise scale a few hours of
    // traffic across the whole month and read as a wild overrun.
    const date = new Date(at)
    const dayOfMonth = date.getUTCDate()
    const daysInMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
    const observedSince = monthDays[0]?.date ?? null
    const observedDays = observedSince ? dayOfMonth - Number(observedSince.slice(8, 10)) + 1 : 0

    return {
      measurement: 'authorized-get-bytes',
      today,
      todayBytes: todayDay?.bytes ?? 0,
      todayDownloads: todayDay?.downloads ?? 0,
      month,
      monthBytes,
      monthDownloads: monthDays.reduce((total, day) => total + day.downloads, 0),
      budgetBytes,
      budgetUsedPercent: budgetBytes > 0 ? Math.round((monthBytes / budgetBytes) * 1000) / 10 : null,
      projectedMonthBytes: observedDays > 0 ? Math.round((monthBytes / observedDays) * daysInMonth) : monthBytes,
      observedSince,
      observedDays,
      topPackages: [...packages.values()].sort((a, b) => b.bytes - a.bytes).slice(0, 20),
      days,
    }
  }

  /** Serializable state for the snapshot store. */
  toJSON(): { days: EgressDay[] } {
    return { days: [...this.days.values()].sort((a, b) => a.date.localeCompare(b.date)) }
  }

  /** Restore from a persisted snapshot, ignoring anything malformed. */
  load(state: unknown): void {
    const days = (state as { days?: unknown })?.days
    if (!Array.isArray(days))
      return
    for (const entry of days) {
      const date = (entry as EgressDay)?.date
      const bytes = Number((entry as EgressDay)?.bytes)
      const downloads = Number((entry as EgressDay)?.downloads)
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))
        continue
      if (!Number.isFinite(bytes) || bytes < 0)
        continue
      this.days.set(date, {
        date,
        bytes,
        downloads: Number.isFinite(downloads) && downloads >= 0 ? downloads : 0,
        packages: Array.isArray(entry?.packages)
          ? entry.packages.filter((item: EgressPackage) =>
            item && typeof item.packageName === 'string'
            && Number.isFinite(item.bytes) && item.bytes >= 0
            && Number.isFinite(item.downloads) && item.downloads >= 0,
          ).slice(0, MAX_PACKAGES_PER_DAY + 1).map((item: EgressPackage) => ({ ...item }))
          : undefined,
      })
    }
    this.prune()
  }

  /**
   * Keep the newest {@link RETENTION_DAYS} buckets.
   *
   * Counting entries rather than comparing against a cutoff date keeps the
   * bound exact regardless of gaps — a quiet week creates no buckets, and a
   * date-based cutoff would then retain more or fewer than intended.
   */
  private prune(): void {
    if (this.days.size <= RETENTION_DAYS)
      return
    const oldestFirst = [...this.days.keys()].sort()
    for (const key of oldestFirst.slice(0, this.days.size - RETENTION_DAYS))
      this.days.delete(key)
  }
}
