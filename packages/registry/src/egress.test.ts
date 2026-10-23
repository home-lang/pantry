import { describe, expect, it } from 'bun:test'
import { EgressLedger, egressBudgetBytes } from './egress'

const GB = 1000 ** 3
const TB = 1000 ** 4
const DAY = 24 * 60 * 60 * 1000

/** 2026-08-06T12:00:00Z — mid-month, so projections have something to scale. */
const AUG_6 = Date.parse('2026-08-06T12:00:00.000Z')

function ledgerAt(now: () => number, budget = 0) {
  return new EgressLedger(now, () => budget)
}

describe('EgressLedger', () => {
  it('accumulates today and month-to-date', () => {
    const ledger = ledgerAt(() => AUG_6)
    ledger.record(10 * GB)
    ledger.record(5 * GB)

    const snapshot = ledger.snapshot()
    expect(snapshot.today).toBe('2026-08-06')
    expect(snapshot.todayBytes).toBe(15 * GB)
    expect(snapshot.todayDownloads).toBe(2)
    expect(snapshot.month).toBe('2026-08')
    expect(snapshot.monthBytes).toBe(15 * GB)
  })

  it('separates days and sums only the current month', () => {
    let now = Date.parse('2026-07-31T12:00:00.000Z')
    const ledger = ledgerAt(() => now)
    ledger.record(100 * GB)

    now = AUG_6
    ledger.record(20 * GB)

    const snapshot = ledger.snapshot()
    expect(snapshot.monthBytes).toBe(20 * GB)
    expect(snapshot.days).toHaveLength(2)
    expect(snapshot.days.at(-1)?.date).toBe('2026-08-06')
  })

  it('reports usage against a configured allowance', () => {
    const ledger = ledgerAt(() => AUG_6, 5 * TB)
    ledger.record(1 * TB)

    const snapshot = ledger.snapshot()
    expect(snapshot.budgetBytes).toBe(5 * TB)
    expect(snapshot.budgetUsedPercent).toBe(20)
  })

  it('leaves the allowance share null when none is configured', () => {
    const ledger = ledgerAt(() => AUG_6)
    ledger.record(1 * TB)
    expect(ledger.snapshot().budgetUsedPercent).toBeNull()
  })

  it('projects month-end from the observed days, without assuming missing history was idle', () => {
    // 6 days in with 1.2 TB used ⇒ 0.2 TB/day ⇒ 6.2 TB across August's 31 days.
    const ledger = ledgerAt(() => AUG_6)
    ledger.load({ days: [{ date: '2026-08-01', bytes: 0, downloads: 0 }] })
    ledger.record(1.2 * TB)
    expect(ledger.snapshot().projectedMonthBytes).toBe(6.2 * TB)
  })

  it('exposes partial-month coverage and projects from it', () => {
    const ledger = ledgerAt(() => AUG_6)
    ledger.record(100 * GB)
    const snapshot = ledger.snapshot()
    expect(snapshot.observedSince).toBe('2026-08-06')
    expect(snapshot.observedDays).toBe(1)
    expect(snapshot.projectedMonthBytes).toBe(3.1 * TB)
  })

  it('ranks and persists attributed package bytes without inventing historical attribution', () => {
    const ledger = ledgerAt(() => AUG_6)
    ledger.record(GB)
    ledger.record(2 * GB, 'github.com/example/tool')
    ledger.record(3 * GB, 'ziglang.org')
    ledger.record(2 * GB, 'github.com/example/tool')
    const restored = ledgerAt(() => AUG_6)
    restored.load(ledger.toJSON())
    expect(restored.snapshot().topPackages).toEqual([
      { packageName: 'github.com/example/tool', bytes: 4 * GB, downloads: 2 },
      { packageName: 'ziglang.org', bytes: 3 * GB, downloads: 1 },
    ])
    expect(restored.snapshot().monthBytes).toBe(8 * GB)
  })

  it('bounds package attribution while retaining all bytes', () => {
    const ledger = ledgerAt(() => AUG_6)
    for (let i = 0; i < 600; i++) ledger.record(GB, `package-${i}`)
    expect(ledger.toJSON().days[0].packages?.length).toBeLessThanOrEqual(513)
    expect(ledger.snapshot().monthBytes).toBe(600 * GB)
    expect(ledger.snapshot().topPackages[0]).toEqual({ packageName: '(other)', bytes: 88 * GB, downloads: 88 })
  })

  it('ignores negative and non-finite sizes', () => {
    const ledger = ledgerAt(() => AUG_6)
    ledger.record(-5)
    ledger.record(Number.NaN)
    ledger.record(Number.POSITIVE_INFINITY)
    expect(ledger.snapshot().todayBytes).toBe(0)
    expect(ledger.snapshot().todayDownloads).toBe(0)
  })

  it('round-trips through its serialized form', () => {
    const ledger = ledgerAt(() => AUG_6)
    ledger.record(7 * GB)

    const restored = ledgerAt(() => AUG_6)
    restored.load(ledger.toJSON())

    expect(restored.snapshot().monthBytes).toBe(7 * GB)
    expect(restored.snapshot().todayDownloads).toBe(1)
  })

  it('discards malformed entries when loading', () => {
    const ledger = ledgerAt(() => AUG_6)
    ledger.load({
      days: [
        { date: '2026-08-06', bytes: 5 * GB, downloads: 1 },
        { date: 'not-a-date', bytes: 999 * TB, downloads: 1 },
        { date: '2026-08-05', bytes: -1, downloads: 1 },
        null,
      ],
    })
    expect(ledger.snapshot().monthBytes).toBe(5 * GB)
  })

  it('survives a load of anything that is not a ledger', () => {
    const ledger = ledgerAt(() => AUG_6)
    ledger.load(null)
    ledger.load({ days: 'nope' })
    expect(ledger.snapshot().monthBytes).toBe(0)
  })

  it('drops history beyond the retention window', () => {
    let now = AUG_6 - 200 * DAY
    const ledger = ledgerAt(() => now)
    for (let i = 0; i < 200; i++) {
      ledger.record(GB)
      now += DAY
    }
    expect(ledger.snapshot().days.length).toBeLessThanOrEqual(62)
  })

  it('persists no more than once per interval', () => {
    let now = AUG_6
    const ledger = ledgerAt(() => now)
    let saves = 0
    ledger.persistWith(() => { saves++ })

    for (let i = 0; i < 500; i++) ledger.record(GB)
    expect(saves).toBe(1)

    now += 61_000
    ledger.record(GB)
    expect(saves).toBe(2)
  })
})

describe('egressBudgetBytes', () => {
  it('reads a decimal-TB allowance, matching how providers quote and bill', () => {
    expect(egressBudgetBytes({ PANTRY_EGRESS_BUDGET_TB: '5' } as NodeJS.ProcessEnv)).toBe(5 * TB)
    expect(egressBudgetBytes({ PANTRY_EGRESS_BUDGET_TB: '0.5' } as NodeJS.ProcessEnv)).toBe(0.5 * TB)
  })

  it('treats unset, zero, and unparseable values as no allowance', () => {
    expect(egressBudgetBytes({} as NodeJS.ProcessEnv)).toBe(0)
    expect(egressBudgetBytes({ PANTRY_EGRESS_BUDGET_TB: '0' } as NodeJS.ProcessEnv)).toBe(0)
    expect(egressBudgetBytes({ PANTRY_EGRESS_BUDGET_TB: 'lots' } as NodeJS.ProcessEnv)).toBe(0)
    expect(egressBudgetBytes({ PANTRY_EGRESS_BUDGET_TB: '-3' } as NodeJS.ProcessEnv)).toBe(0)
  })
})
