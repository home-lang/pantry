/**
 * Registry Analytics
 * Track package downloads and provide statistics
 */

import { DynamoDBClient } from './storage/dynamodb-client'

export type AnalyticsCategory = 'install' | 'install_on_request' | 'build_error'

export interface DownloadEvent {
  packageName: string
  version: string
  timestamp: string
  userAgent?: string
  ip?: string
  region?: string
}

export interface AnalyticsEvent {
  packageName: string
  category: AnalyticsCategory
  timestamp: string
  version?: string
  userAgent?: string
  ip?: string
  region?: string
}

export interface PackageStats {
  packageName: string
  totalDownloads: number
  weeklyDownloads: number
  monthlyDownloads: number
  versionDownloads: Record<string, number>
  lastDownload?: string
}

export interface InstallAnalyticsResult {
  category: string
  total_items: number
  start_date: string
  end_date: string
  total_count: number
  items: Array<{
    number: number
    formula: string
    count: string
    percent: string
  }>
}

export interface AnalyticsStorage {
  trackDownload(event: DownloadEvent): Promise<void>
  trackEvent(event: AnalyticsEvent): Promise<void>
  getPackageStats(packageName: string): Promise<PackageStats | null>
  getTopPackages(limit?: number): Promise<Array<{ name: string, downloads: number }>>
  getDownloadTimeline(packageName: string, days?: number): Promise<Array<{ date: string, count: number }>>
  getInstallAnalytics(days: 30 | 90 | 365): Promise<InstallAnalyticsResult>
  getCategoryAnalytics(category: AnalyticsCategory, days: 30 | 90 | 365): Promise<InstallAnalyticsResult>
}

function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

function getDateRange(days: number): { startDate: string, endDate: string, dates: string[] } {
  const now = new Date()
  const endDate = now.toISOString().split('T')[0]
  const dates: string[] = []

  // days=30 means today + 29 days back (30 total days)
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    dates.push(date.toISOString().split('T')[0])
  }

  return { startDate: dates[0], endDate, dates }
}

function categorySKPrefix(category: AnalyticsCategory): string {
  switch (category) {
    case 'install': return 'PACKAGE#'
    case 'install_on_request': return 'INSTALL_ON_REQUEST#'
    case 'build_error': return 'BUILD_ERROR#'
  }
}

function buildInstallAnalyticsResult(
  aggregated: Map<string, number>,
  startDate: string,
  endDate: string,
  category: AnalyticsCategory = 'install',
): InstallAnalyticsResult {
  const sorted = Array.from(aggregated.entries())
    .sort((a, b) => b[1] - a[1])

  const totalCount = sorted.reduce((sum, [, count]) => sum + count, 0)

  return {
    category,
    total_items: sorted.length,
    start_date: startDate,
    end_date: endDate,
    total_count: totalCount,
    items: sorted.map(([name, count], index) => ({
      number: index + 1,
      formula: name,
      count: formatCount(count),
      percent: totalCount > 0 ? ((count / totalCount) * 100).toFixed(2) : '0.00',
    })),
  }
}

/**
 * DynamoDB-based analytics storage for production
 *
 * Table Schema (single table design):
 * PK: PACKAGE#{name} or DAILY#{date}
 * SK: STATS or VERSION#{version} or PACKAGE#{name}
 *
 * Access patterns:
 * 1. Get package stats: PK = PACKAGE#{name}, SK = STATS
 * 2. Get version stats: PK = PACKAGE#{name}, SK begins_with VERSION#
 * 3. Get daily downloads: PK = DAILY#{date}, SK = PACKAGE#{name}
 * 4. Get top packages: Scan with filter or use GSI
 */
export class DynamoDBAnalytics implements AnalyticsStorage {
  private db: DynamoDBClient
  private tableName: string

  constructor(tableName: string, region = 'us-east-1') {
    this.tableName = tableName
    this.db = new DynamoDBClient(region)
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const { packageName, category, timestamp } = event
    const date = timestamp.split('T')[0]
    const prefix = categorySKPrefix(category)

    await this.db.updateItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `DAILY#${date}` },
        SK: { S: `${prefix}${packageName}` },
      },
      UpdateExpression: 'SET downloads = if_not_exists(downloads, :zero) + :one, packageName = :name',
      ExpressionAttributeValues: {
        ':zero': { N: '0' },
        ':one': { N: '1' },
        ':name': { S: packageName },
      },
    })
  }

  async trackDownload(event: DownloadEvent): Promise<void> {
    const { packageName, version, timestamp } = event
    const date = timestamp.split('T')[0] // YYYY-MM-DD

    // Update package total stats (atomic increment)
    await this.db.updateItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${packageName}` },
        SK: { S: 'STATS' },
      },
      UpdateExpression: 'SET totalDownloads = if_not_exists(totalDownloads, :zero) + :one, lastDownload = :ts, packageName = :name',
      ExpressionAttributeValues: {
        ':zero': { N: '0' },
        ':one': { N: '1' },
        ':ts': { S: timestamp },
        ':name': { S: packageName },
      },
    })

    // Update version stats
    await this.db.updateItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${packageName}` },
        SK: { S: `VERSION#${version}` },
      },
      UpdateExpression: 'SET downloads = if_not_exists(downloads, :zero) + :one, version = :ver',
      ExpressionAttributeValues: {
        ':zero': { N: '0' },
        ':one': { N: '1' },
        ':ver': { S: version },
      },
    })

    // Update daily stats for timeline
    await this.db.updateItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `DAILY#${date}` },
        SK: { S: `PACKAGE#${packageName}` },
      },
      UpdateExpression: 'SET downloads = if_not_exists(downloads, :zero) + :one, packageName = :name',
      ExpressionAttributeValues: {
        ':zero': { N: '0' },
        ':one': { N: '1' },
        ':name': { S: packageName },
      },
    })
  }

  async getPackageStats(packageName: string): Promise<PackageStats | null> {
    // Get main stats
    const statsResult = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${packageName}` },
        SK: { S: 'STATS' },
      },
    })

    if (!statsResult.Item) {
      return null
    }

    const stats = DynamoDBClient.unmarshal(statsResult.Item)

    // Get version breakdown
    const versionsResult = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': { S: `PACKAGE#${packageName}` },
        ':prefix': { S: 'VERSION#' },
      },
    })

    const versionDownloads: Record<string, number> = {}
    for (const item of versionsResult.Items) {
      const data = DynamoDBClient.unmarshal(item)
      if (data.version) {
        versionDownloads[data.version] = data.downloads || 0
      }
    }

    // Calculate weekly/monthly (query daily stats)
    const now = new Date()
    const _weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const _monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    let weeklyDownloads = 0
    let monthlyDownloads = 0

    // Get last 30 days of daily stats
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]

      try {
        const dailyResult = await this.db.getItem({
          TableName: this.tableName,
          Key: {
            PK: { S: `DAILY#${dateStr}` },
            SK: { S: `PACKAGE#${packageName}` },
          },
        })

        if (dailyResult.Item) {
          const daily = DynamoDBClient.unmarshal(dailyResult.Item)
          const count = daily.downloads || 0
          monthlyDownloads += count
          if (i < 7) {
            weeklyDownloads += count
          }
        }
      }
      catch {
        // Ignore errors for missing days
      }
    }

    return {
      packageName,
      totalDownloads: stats.totalDownloads || 0,
      weeklyDownloads,
      monthlyDownloads,
      versionDownloads,
      lastDownload: stats.lastDownload,
    }
  }

  async getTopPackages(limit = 10): Promise<Array<{ name: string, downloads: number }>> {
    // Scan for all package stats - in production, use a GSI for this
    const result = await this.db.scan({
      TableName: this.tableName,
      FilterExpression: 'SK = :stats',
      ExpressionAttributeValues: {
        ':stats': { S: 'STATS' },
      },
    })

    const packages = result.Items.map((item) => {
      const data = DynamoDBClient.unmarshal(item)
      return {
        name: data.packageName,
        downloads: data.totalDownloads || 0,
      }
    })

    // Sort by downloads descending
    packages.sort((a, b) => b.downloads - a.downloads)

    return packages.slice(0, limit)
  }

  async getDownloadTimeline(packageName: string, days = 30): Promise<Array<{ date: string, count: number }>> {
    const timeline: Array<{ date: string, count: number }> = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]

      try {
        const result = await this.db.getItem({
          TableName: this.tableName,
          Key: {
            PK: { S: `DAILY#${dateStr}` },
            SK: { S: `PACKAGE#${packageName}` },
          },
        })

        const count = result.Item
          ? DynamoDBClient.unmarshal(result.Item).downloads || 0
          : 0

        timeline.push({ date: dateStr, count })
      }
      catch {
        timeline.push({ date: dateStr, count: 0 })
      }
    }

    return timeline
  }

  async getCategoryAnalytics(category: AnalyticsCategory, days: 30 | 90 | 365): Promise<InstallAnalyticsResult> {
    const { startDate, endDate, dates } = getDateRange(days)
    const aggregated = new Map<string, number>()
    const prefix = categorySKPrefix(category)

    // Query in batches of 25 parallel requests
    const batchSize = 25
    for (let i = 0; i < dates.length; i += batchSize) {
      const batch = dates.slice(i, i + batchSize)
      const results = await Promise.all(
        batch.map(date =>
          this.db.query({
            TableName: this.tableName,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
            ExpressionAttributeValues: {
              ':pk': { S: `DAILY#${date}` },
              ':prefix': { S: prefix },
            },
          }).catch(() => ({ Items: [] as Array<Record<string, any>>, Count: 0 })),
        ),
      )

      for (const result of results) {
        for (const item of result.Items) {
          const data = DynamoDBClient.unmarshal(item)
          if (data.packageName) {
            aggregated.set(
              data.packageName,
              (aggregated.get(data.packageName) || 0) + (data.downloads || 0),
            )
          }
        }
      }
    }

    return buildInstallAnalyticsResult(aggregated, startDate, endDate, category)
  }

  async getInstallAnalytics(days: 30 | 90 | 365): Promise<InstallAnalyticsResult> {
    return this.getCategoryAnalytics('install', days)
  }
}

/**
 * In-memory analytics storage for development/testing
 */
export class InMemoryAnalytics implements AnalyticsStorage {
  private downloads: DownloadEvent[] = []
  private packageStats: Map<string, { total: number, versions: Record<string, number>, lastDownload?: string }> = new Map()
  private dailyStats: Map<string, Map<string, number>> = new Map() // date -> package -> count
  private categoryDailyStats: Map<string, Map<string, number>> = new Map() // "{category}:{date}" -> package -> count

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const date = event.timestamp.split('T')[0]
    const key = `${event.category}:${date}`
    if (!this.categoryDailyStats.has(key)) {
      this.categoryDailyStats.set(key, new Map())
    }
    const packages = this.categoryDailyStats.get(key)!
    packages.set(event.packageName, (packages.get(event.packageName) || 0) + 1)
  }

  async trackDownload(event: DownloadEvent): Promise<void> {
    this.downloads.push(event)

    // Update package stats
    const stats = this.packageStats.get(event.packageName) || { total: 0, versions: {} }
    stats.total++
    stats.versions[event.version] = (stats.versions[event.version] || 0) + 1
    stats.lastDownload = event.timestamp
    this.packageStats.set(event.packageName, stats)

    // Update daily stats
    const date = event.timestamp.split('T')[0]
    if (!this.dailyStats.has(date)) {
      this.dailyStats.set(date, new Map())
    }
    const dailyPackages = this.dailyStats.get(date)!
    dailyPackages.set(event.packageName, (dailyPackages.get(event.packageName) || 0) + 1)

    // Also write to categoryDailyStats under 'install' for consistency
    const installKey = `install:${date}`
    if (!this.categoryDailyStats.has(installKey)) {
      this.categoryDailyStats.set(installKey, new Map())
    }
    const installPackages = this.categoryDailyStats.get(installKey)!
    installPackages.set(event.packageName, (installPackages.get(event.packageName) || 0) + 1)
  }

  async getPackageStats(packageName: string): Promise<PackageStats | null> {
    const stats = this.packageStats.get(packageName)
    if (!stats) {
      return null
    }

    const now = new Date()
    let weeklyDownloads = 0
    let monthlyDownloads = 0

    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dailyPackages = this.dailyStats.get(dateStr)
      const count = dailyPackages?.get(packageName) || 0

      monthlyDownloads += count
      if (i < 7) {
        weeklyDownloads += count
      }
    }

    return {
      packageName,
      totalDownloads: stats.total,
      weeklyDownloads,
      monthlyDownloads,
      versionDownloads: stats.versions,
      lastDownload: stats.lastDownload,
    }
  }

  async getTopPackages(limit = 10): Promise<Array<{ name: string, downloads: number }>> {
    const packages = Array.from(this.packageStats.entries())
      .map(([name, stats]) => ({ name, downloads: stats.total }))
      .sort((a, b) => b.downloads - a.downloads)

    return packages.slice(0, limit)
  }

  async getDownloadTimeline(packageName: string, days = 30): Promise<Array<{ date: string, count: number }>> {
    const timeline: Array<{ date: string, count: number }> = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dailyPackages = this.dailyStats.get(dateStr)
      const count = dailyPackages?.get(packageName) || 0
      timeline.push({ date: dateStr, count })
    }

    return timeline
  }

  async getCategoryAnalytics(category: AnalyticsCategory, days: 30 | 90 | 365): Promise<InstallAnalyticsResult> {
    const { startDate, endDate, dates } = getDateRange(days)
    const aggregated = new Map<string, number>()

    for (const date of dates) {
      const key = `${category}:${date}`
      const packages = this.categoryDailyStats.get(key)
      if (packages) {
        for (const [name, count] of packages) {
          aggregated.set(name, (aggregated.get(name) || 0) + count)
        }
      }
    }

    return buildInstallAnalyticsResult(aggregated, startDate, endDate, category)
  }

  async getInstallAnalytics(days: 30 | 90 | 365): Promise<InstallAnalyticsResult> {
    return this.getCategoryAnalytics('install', days)
  }
}

/**
 * Create analytics storage based on environment
 */
export function createAnalytics(config?: { tableName?: string, region?: string }): AnalyticsStorage {
  if (config?.tableName) {
    return new DynamoDBAnalytics(config.tableName, config.region)
  }
  return new InMemoryAnalytics()
}
