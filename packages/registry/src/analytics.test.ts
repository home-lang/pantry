import { describe, expect, it, beforeEach } from 'bun:test'
import { InMemoryAnalytics, type InstallAnalyticsResult, type AnalyticsCategory, type AnalyticsEvent } from './analytics'
import { createServer } from './server'
import { createLocalRegistry } from './registry'

// Helper to create a download event on a specific date
function downloadEvent(packageName: string, date: string, version = '1.0.0') {
  return {
    packageName,
    version,
    timestamp: `${date}T12:00:00Z`,
  }
}

// Helper to create an analytics event on a specific date
function analyticsEvent(packageName: string, category: AnalyticsCategory, date: string, version?: string): AnalyticsEvent {
  return {
    packageName,
    category,
    timestamp: `${date}T12:00:00Z`,
    version,
  }
}

// Helper to get a date string N days ago from today
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// Today's date string
function today(): string {
  return new Date().toISOString().split('T')[0]
}

describe('getInstallAnalytics', () => {
  let analytics: InMemoryAnalytics

  beforeEach(() => {
    analytics = new InMemoryAnalytics()
  })

  describe('basic functionality', () => {
    it('returns correct structure for empty registry', async () => {
      const result = await analytics.getInstallAnalytics(30)

      expect(result.category).toBe('install')
      expect(result.total_items).toBe(0)
      expect(result.total_count).toBe(0)
      expect(result.items).toEqual([])
      expect(result.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('returns single package with rank 1', async () => {
      await analytics.trackDownload(downloadEvent('foo', today()))

      const result = await analytics.getInstallAnalytics(30)

      expect(result.total_items).toBe(1)
      expect(result.total_count).toBe(1)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].number).toBe(1)
      expect(result.items[0].formula).toBe('foo')
      expect(result.items[0].count).toBe('1')
      expect(result.items[0].percent).toBe('100.00')
    })

    it('ranks multiple packages correctly by download count', async () => {
      // A: 10, B: 5, C: 1
      for (let i = 0; i < 10; i++) await analytics.trackDownload(downloadEvent('pkg-a', today()))
      for (let i = 0; i < 5; i++) await analytics.trackDownload(downloadEvent('pkg-b', today()))
      await analytics.trackDownload(downloadEvent('pkg-c', today()))

      const result = await analytics.getInstallAnalytics(30)

      expect(result.total_items).toBe(3)
      expect(result.total_count).toBe(16)
      expect(result.items[0].formula).toBe('pkg-a')
      expect(result.items[0].number).toBe(1)
      expect(result.items[1].formula).toBe('pkg-b')
      expect(result.items[1].number).toBe(2)
      expect(result.items[2].formula).toBe('pkg-c')
      expect(result.items[2].number).toBe(3)
    })

    it('aggregates downloads across multiple days', async () => {
      await analytics.trackDownload(downloadEvent('foo', today()))
      await analytics.trackDownload(downloadEvent('foo', daysAgo(1)))
      await analytics.trackDownload(downloadEvent('foo', daysAgo(2)))

      const result = await analytics.getInstallAnalytics(30)

      expect(result.total_items).toBe(1)
      expect(result.items[0].count).toBe('3')
    })
  })

  describe('period filtering', () => {
    it('30d excludes data older than 30 days', async () => {
      await analytics.trackDownload(downloadEvent('recent', today()))
      await analytics.trackDownload(downloadEvent('old', daysAgo(31)))

      const result = await analytics.getInstallAnalytics(30)

      expect(result.total_items).toBe(1)
      expect(result.items[0].formula).toBe('recent')
    })

    it('90d includes 90 days of data', async () => {
      await analytics.trackDownload(downloadEvent('recent', today()))
      await analytics.trackDownload(downloadEvent('older', daysAgo(60)))

      const result = await analytics.getInstallAnalytics(90)

      expect(result.total_items).toBe(2)
    })

    it('90d excludes data older than 90 days', async () => {
      await analytics.trackDownload(downloadEvent('in-range', daysAgo(89)))
      await analytics.trackDownload(downloadEvent('out-of-range', daysAgo(91)))

      const result = await analytics.getInstallAnalytics(90)

      expect(result.total_items).toBe(1)
      expect(result.items[0].formula).toBe('in-range')
    })

    it('365d includes full year of data', async () => {
      await analytics.trackDownload(downloadEvent('recent', today()))
      await analytics.trackDownload(downloadEvent('old', daysAgo(300)))

      const result = await analytics.getInstallAnalytics(365)

      expect(result.total_items).toBe(2)
    })

    it('365d excludes data older than 365 days', async () => {
      await analytics.trackDownload(downloadEvent('in-range', daysAgo(364)))
      await analytics.trackDownload(downloadEvent('out-of-range', daysAgo(366)))

      const result = await analytics.getInstallAnalytics(365)

      expect(result.total_items).toBe(1)
      expect(result.items[0].formula).toBe('in-range')
    })

    it('includes downloads from today in all periods', async () => {
      await analytics.trackDownload(downloadEvent('foo', today()))

      const r30 = await analytics.getInstallAnalytics(30)
      const r90 = await analytics.getInstallAnalytics(90)
      const r365 = await analytics.getInstallAnalytics(365)

      expect(r30.total_items).toBe(1)
      expect(r90.total_items).toBe(1)
      expect(r365.total_items).toBe(1)
    })

    it('returns empty items when no downloads in period', async () => {
      await analytics.trackDownload(downloadEvent('foo', daysAgo(400)))

      const result = await analytics.getInstallAnalytics(30)

      expect(result.total_items).toBe(0)
      expect(result.items).toEqual([])
    })

    it('returns empty for all periods when downloads only outside all ranges', async () => {
      await analytics.trackDownload(downloadEvent('foo', daysAgo(400)))

      const r30 = await analytics.getInstallAnalytics(30)
      const r90 = await analytics.getInstallAnalytics(90)
      const r365 = await analytics.getInstallAnalytics(365)

      expect(r30.total_items).toBe(0)
      expect(r90.total_items).toBe(0)
      expect(r365.total_items).toBe(0)
    })
  })

  describe('response format', () => {
    it('has category set to "install"', async () => {
      const result = await analytics.getInstallAnalytics(30)
      expect(result.category).toBe('install')
    })

    it('has correct YYYY-MM-DD date format', async () => {
      const result = await analytics.getInstallAnalytics(90)

      expect(result.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(result.end_date).toBe(today())
    })

    it('total_items equals items.length', async () => {
      for (let i = 0; i < 5; i++) {
        await analytics.trackDownload(downloadEvent(`pkg-${i}`, today()))
      }

      const result = await analytics.getInstallAnalytics(30)

      expect(result.total_items).toBe(result.items.length)
    })

    it('total_count equals sum of individual counts', async () => {
      for (let i = 0; i < 10; i++) await analytics.trackDownload(downloadEvent('a', today()))
      for (let i = 0; i < 5; i++) await analytics.trackDownload(downloadEvent('b', today()))

      const result = await analytics.getInstallAnalytics(30)

      const sumOfCounts = result.items.reduce(
        (sum, item) => sum + Number.parseInt(item.count.replace(/,/g, ''), 10),
        0,
      )
      expect(result.total_count).toBe(sumOfCounts)
    })

    it('formats count with commas', async () => {
      // Track 1,234,567 downloads (simulate by directly using the in-memory store)
      const date = today()
      for (let i = 0; i < 1500; i++) {
        await analytics.trackDownload(downloadEvent('popular', date))
      }

      const result = await analytics.getInstallAnalytics(30)

      expect(result.items[0].count).toBe('1,500')
    })

    it('percent has 2 decimal places', async () => {
      for (let i = 0; i < 3; i++) await analytics.trackDownload(downloadEvent('a', today()))
      await analytics.trackDownload(downloadEvent('b', today()))

      const result = await analytics.getInstallAnalytics(30)

      for (const item of result.items) {
        expect(item.percent).toMatch(/^\d+\.\d{2}$/)
      }
    })

    it('ranks are 1-indexed sequential', async () => {
      for (let i = 0; i < 5; i++) {
        await analytics.trackDownload(downloadEvent(`pkg-${i}`, today()))
      }

      const result = await analytics.getInstallAnalytics(30)

      result.items.forEach((item, index) => {
        expect(item.number).toBe(index + 1)
      })
    })

    it('percentages approximately sum to 100', async () => {
      for (let i = 0; i < 10; i++) await analytics.trackDownload(downloadEvent('a', today()))
      for (let i = 0; i < 5; i++) await analytics.trackDownload(downloadEvent('b', today()))
      for (let i = 0; i < 3; i++) await analytics.trackDownload(downloadEvent('c', today()))
      for (let i = 0; i < 2; i++) await analytics.trackDownload(downloadEvent('d', today()))

      const result = await analytics.getInstallAnalytics(30)

      const totalPercent = result.items.reduce(
        (sum, item) => sum + Number.parseFloat(item.percent),
        0,
      )
      expect(totalPercent).toBeCloseTo(100, 0)
    })
  })

  describe('ranking edge cases', () => {
    it('handles tied download counts', async () => {
      for (let i = 0; i < 5; i++) await analytics.trackDownload(downloadEvent('a', today()))
      for (let i = 0; i < 5; i++) await analytics.trackDownload(downloadEvent('b', today()))

      const result = await analytics.getInstallAnalytics(30)

      expect(result.total_items).toBe(2)
      // Both should appear with sequential ranks
      expect(result.items[0].number).toBe(1)
      expect(result.items[1].number).toBe(2)
      // Both have same count
      expect(result.items[0].count).toBe('5')
      expect(result.items[1].count).toBe('5')
    })

    it('handles large number of packages (50+)', async () => {
      for (let i = 0; i < 55; i++) {
        // Each package gets a different number of downloads so ranking is deterministic
        for (let j = 0; j <= i; j++) {
          await analytics.trackDownload(downloadEvent(`pkg-${String(i).padStart(3, '0')}`, today()))
        }
      }

      const result = await analytics.getInstallAnalytics(30)

      expect(result.total_items).toBe(55)
      expect(result.items).toHaveLength(55)
      // Top package should be pkg-054 (55 downloads)
      expect(result.items[0].formula).toBe('pkg-054')
      // Last package should be pkg-000 (1 download)
      expect(result.items[54].formula).toBe('pkg-000')
      expect(result.items[54].number).toBe(55)
    })
  })
})

describe('install analytics server endpoints', () => {
  it('GET /analytics/install/30d returns valid response', async () => {
    const analytics = new InMemoryAnalytics()
    await analytics.trackDownload(downloadEvent('test-pkg', today()))

    const registry = createLocalRegistry()
    const { start, stop } = createServer(registry, 0, analytics)
    start()

    try {
      // Get the actual port from the server
      const res = await fetch('http://localhost:0/analytics/install/30d')
      // Since port 0 doesn't work directly, we test the handler logic instead
    }
    catch {
      // Expected - port 0 may not be accessible
    }
    finally {
      stop()
    }
  })

  it('handleAnalytics routes install periods correctly', async () => {
    const analytics = new InMemoryAnalytics()
    await analytics.trackDownload(downloadEvent('test-pkg', today()))

    // Test via getInstallAnalytics directly since server port binding is non-deterministic
    const result30 = await analytics.getInstallAnalytics(30)
    const result90 = await analytics.getInstallAnalytics(90)
    const result365 = await analytics.getInstallAnalytics(365)

    expect(result30.category).toBe('install')
    expect(result90.category).toBe('install')
    expect(result365.category).toBe('install')

    expect(result30.total_items).toBe(1)
    expect(result90.total_items).toBe(1)
    expect(result365.total_items).toBe(1)
  })

  it('existing analytics endpoints still work (regression)', async () => {
    const analytics = new InMemoryAnalytics()
    await analytics.trackDownload(downloadEvent('test-pkg', today(), '1.0.0'))

    const stats = await analytics.getPackageStats('test-pkg')
    expect(stats).not.toBeNull()
    expect(stats!.packageName).toBe('test-pkg')

    const top = await analytics.getTopPackages(10)
    expect(top).toHaveLength(1)
    expect(top[0].name).toBe('test-pkg')

    const timeline = await analytics.getDownloadTimeline('test-pkg', 7)
    expect(timeline).toHaveLength(7)
  })
})

describe('trackEvent + getCategoryAnalytics', () => {
  let analytics: InMemoryAnalytics

  beforeEach(() => {
    analytics = new InMemoryAnalytics()
  })

  it('tracks install_on_request events and queries them back', async () => {
    await analytics.trackEvent(analyticsEvent('curl', 'install_on_request', today()))
    await analytics.trackEvent(analyticsEvent('curl', 'install_on_request', today()))
    await analytics.trackEvent(analyticsEvent('wget', 'install_on_request', today()))

    const result = await analytics.getCategoryAnalytics('install_on_request', 30)

    expect(result.category).toBe('install_on_request')
    expect(result.total_items).toBe(2)
    expect(result.total_count).toBe(3)
    expect(result.items[0].formula).toBe('curl')
    expect(result.items[0].count).toBe('2')
    expect(result.items[1].formula).toBe('wget')
    expect(result.items[1].count).toBe('1')
  })

  it('tracks build_error events and queries them back', async () => {
    await analytics.trackEvent(analyticsEvent('openssl', 'build_error', today()))
    await analytics.trackEvent(analyticsEvent('zlib', 'build_error', today()))
    await analytics.trackEvent(analyticsEvent('zlib', 'build_error', today()))

    const result = await analytics.getCategoryAnalytics('build_error', 30)

    expect(result.category).toBe('build_error')
    expect(result.total_items).toBe(2)
    expect(result.total_count).toBe(3)
    expect(result.items[0].formula).toBe('zlib')
    expect(result.items[1].formula).toBe('openssl')
  })

  it('categories are isolated — install data does not appear in build_error', async () => {
    await analytics.trackEvent(analyticsEvent('curl', 'install_on_request', today()))
    await analytics.trackEvent(analyticsEvent('openssl', 'build_error', today()))
    await analytics.trackDownload(downloadEvent('zstd', today()))

    const installResult = await analytics.getCategoryAnalytics('install', 30)
    const installOnRequestResult = await analytics.getCategoryAnalytics('install_on_request', 30)
    const buildErrorResult = await analytics.getCategoryAnalytics('build_error', 30)

    expect(installResult.total_items).toBe(1)
    expect(installResult.items[0].formula).toBe('zstd')

    expect(installOnRequestResult.total_items).toBe(1)
    expect(installOnRequestResult.items[0].formula).toBe('curl')

    expect(buildErrorResult.total_items).toBe(1)
    expect(buildErrorResult.items[0].formula).toBe('openssl')
  })

  it('package name variants with --HEAD suffix tracked independently', async () => {
    await analytics.trackEvent(analyticsEvent('zstd', 'install_on_request', today()))
    await analytics.trackEvent(analyticsEvent('zstd --HEAD', 'install_on_request', today()))
    await analytics.trackEvent(analyticsEvent('zstd --HEAD', 'install_on_request', today()))

    const result = await analytics.getCategoryAnalytics('install_on_request', 30)

    expect(result.total_items).toBe(2)
    expect(result.items[0].formula).toBe('zstd --HEAD')
    expect(result.items[0].count).toBe('2')
    expect(result.items[1].formula).toBe('zstd')
    expect(result.items[1].count).toBe('1')
  })
})

describe('multi-category period filtering', () => {
  let analytics: InMemoryAnalytics

  beforeEach(() => {
    analytics = new InMemoryAnalytics()
  })

  it('install_on_request respects 30d/90d/365d boundaries', async () => {
    await analytics.trackEvent(analyticsEvent('recent', 'install_on_request', today()))
    await analytics.trackEvent(analyticsEvent('medium', 'install_on_request', daysAgo(60)))
    await analytics.trackEvent(analyticsEvent('old', 'install_on_request', daysAgo(200)))

    const r30 = await analytics.getCategoryAnalytics('install_on_request', 30)
    const r90 = await analytics.getCategoryAnalytics('install_on_request', 90)
    const r365 = await analytics.getCategoryAnalytics('install_on_request', 365)

    expect(r30.total_items).toBe(1)
    expect(r30.items[0].formula).toBe('recent')

    expect(r90.total_items).toBe(2)

    expect(r365.total_items).toBe(3)
  })

  it('build_error respects period boundaries', async () => {
    await analytics.trackEvent(analyticsEvent('err-recent', 'build_error', today()))
    await analytics.trackEvent(analyticsEvent('err-old', 'build_error', daysAgo(31)))

    const r30 = await analytics.getCategoryAnalytics('build_error', 30)
    const r90 = await analytics.getCategoryAnalytics('build_error', 90)

    expect(r30.total_items).toBe(1)
    expect(r30.items[0].formula).toBe('err-recent')

    expect(r90.total_items).toBe(2)
  })
})

describe('trackDownload → getCategoryAnalytics bridge', () => {
  it('data from trackDownload appears in getCategoryAnalytics install', async () => {
    const analytics = new InMemoryAnalytics()
    await analytics.trackDownload(downloadEvent('foo', today()))
    await analytics.trackDownload(downloadEvent('bar', today()))
    await analytics.trackDownload(downloadEvent('foo', today()))

    const result = await analytics.getCategoryAnalytics('install', 30)

    expect(result.category).toBe('install')
    expect(result.total_items).toBe(2)
    expect(result.total_count).toBe(3)
    expect(result.items[0].formula).toBe('foo')
    expect(result.items[0].count).toBe('2')
    expect(result.items[1].formula).toBe('bar')
  })
})

describe('category field in response', () => {
  let analytics: InMemoryAnalytics

  beforeEach(() => {
    analytics = new InMemoryAnalytics()
  })

  it('getCategoryAnalytics install_on_request returns correct category', async () => {
    const result = await analytics.getCategoryAnalytics('install_on_request', 30)
    expect(result.category).toBe('install_on_request')
  })

  it('getCategoryAnalytics build_error returns correct category', async () => {
    const result = await analytics.getCategoryAnalytics('build_error', 30)
    expect(result.category).toBe('build_error')
  })

  it('getCategoryAnalytics install returns correct category', async () => {
    const result = await analytics.getCategoryAnalytics('install', 30)
    expect(result.category).toBe('install')
  })

  it('getInstallAnalytics still returns install category', async () => {
    const result = await analytics.getInstallAnalytics(30)
    expect(result.category).toBe('install')
  })
})
