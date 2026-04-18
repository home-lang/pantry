/**
 * DynamoDB Metadata Storage for Production
 *
 * Single-table design:
 * PK: PACKAGE#{name}
 * SK: METADATA (main record) or VERSION#{version} (version records)
 *
 * GSI1 (for search by keywords - optional, scan used initially):
 * GSI1PK: KEYWORD#{keyword}
 * GSI1SK: PACKAGE#{name}
 */

import type {
  CommitPublish,
  MetadataStorage,
  PackageAccessGrant,
  PackageMetadata,
  PackagePaywall,
  PackageRecord,
  SearchResult,
} from '../types'
import { DynamoDBClient } from './dynamodb-client'

/**
 * Build a bounded searchText field: dedupe keywords, cap array + total length
 * so an attacker can't bloat a metadata item with a giant keywords list.
 */
function buildSearchText(name: string, description: string | undefined, keywords: string[] | undefined): string {
  const cappedKeywords = Array.from(new Set((keywords || []).filter(k => typeof k === 'string' && k.length > 0))).slice(0, 50)
  const raw = [name, description, ...cappedKeywords].filter(Boolean).join(' ').toLowerCase()
  return raw.length > 1024 ? raw.slice(0, 1024) : raw
}

export class DynamoDBMetadataStorage implements MetadataStorage {
  private db: DynamoDBClient
  private tableName: string

  constructor(tableName: string, region = 'us-east-1') {
    this.tableName = tableName
    this.db = new DynamoDBClient(region)
  }

  async getPackage(name: string): Promise<PackageRecord | null> {
    // Get main metadata
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${name}` },
        SK: { S: 'METADATA' },
      },
    })

    if (!result.Item) {
      return null
    }

    const data = DynamoDBClient.unmarshal(result.Item)

    // Get all versions
    const versionsResult = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': { S: `PACKAGE#${name}` },
        ':prefix': { S: 'VERSION#' },
      },
    })

    const versions: Record<string, any> = {}
    for (const item of versionsResult.Items) {
      const versionData = DynamoDBClient.unmarshal(item)
      versions[versionData.version] = {
        version: versionData.version,
        tarballUrl: versionData.tarballUrl,
        checksum: versionData.checksum,
        publishedAt: versionData.publishedAt,
        size: versionData.size || 0,
      }
    }

    return {
      name: data.name,
      description: data.description,
      repository: data.repository,
      homepage: data.homepage,
      license: data.license,
      author: data.author,
      keywords: data.keywords,
      versions,
      latestVersion: data.latestVersion,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      totalDownloads: data.totalDownloads || 0,
    }
  }

  async getPackageVersion(name: string, version: string): Promise<PackageMetadata | null> {
    // Get main metadata for package info
    const metadataResult = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${name}` },
        SK: { S: 'METADATA' },
      },
    })

    if (!metadataResult.Item) {
      return null
    }

    // Get specific version
    const versionResult = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${name}` },
        SK: { S: `VERSION#${version}` },
      },
    })

    if (!versionResult.Item) {
      return null
    }

    const pkgData = DynamoDBClient.unmarshal(metadataResult.Item)
    const versionData = DynamoDBClient.unmarshal(versionResult.Item)

    return {
      name: pkgData.name,
      version: versionData.version,
      description: pkgData.description,
      repository: pkgData.repository,
      homepage: pkgData.homepage,
      license: pkgData.license,
      author: pkgData.author,
      keywords: pkgData.keywords,
      tarballUrl: versionData.tarballUrl,
      checksum: versionData.checksum,
      publishedAt: versionData.publishedAt,
    }
  }

  async putPackage(record: PackageRecord): Promise<void> {
    // Put main metadata
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `PACKAGE#${record.name}`,
        SK: 'METADATA',
        name: record.name,
        description: record.description,
        repository: record.repository,
        homepage: record.homepage,
        license: record.license,
        author: record.author,
        keywords: record.keywords,
        latestVersion: record.latestVersion,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        totalDownloads: record.totalDownloads,
        // For search - store searchable text
        searchText: buildSearchText(record.name, record.description, record.keywords),
      }),
    })

    // Put each version
    for (const [version, versionInfo] of Object.entries(record.versions)) {
      await this.db.putItem({
        TableName: this.tableName,
        Item: DynamoDBClient.marshal({
          PK: `PACKAGE#${record.name}`,
          SK: `VERSION#${version}`,
          version,
          tarballUrl: versionInfo.tarballUrl,
          checksum: versionInfo.checksum,
          publishedAt: versionInfo.publishedAt,
          size: versionInfo.size,
        }),
      })
    }
  }

  async putVersion(name: string, version: string, metadata: PackageMetadata): Promise<void> {
    const now = new Date().toISOString()

    // Check if package exists
    const existing = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${name}` },
        SK: { S: 'METADATA' },
      },
    })

    let existingItem = existing.Item
    if (!existingItem) {
      // Create new package with a condition so a racing publisher can't
      // create the same package record twice.
      try {
        await this.db.putItem({
          TableName: this.tableName,
          Item: DynamoDBClient.marshal({
            PK: `PACKAGE#${name}`,
            SK: 'METADATA',
            name,
            description: metadata.description,
            repository: metadata.repository,
            homepage: metadata.homepage,
            license: metadata.license,
            author: metadata.author,
            keywords: metadata.keywords,
            latestVersion: version,
            createdAt: now,
            updatedAt: now,
            totalDownloads: 0,
            searchText: buildSearchText(name, metadata.description, metadata.keywords),
          }),
          ConditionExpression: 'attribute_not_exists(PK)',
        } as any)
      }
      catch (err) {
        const awsType = (err as { awsType?: string })?.awsType || ''
        if (!awsType.includes('ConditionalCheckFailed')) throw err
        // Someone beat us — fall through to the update path.
        const retry = await this.db.getItem({
          TableName: this.tableName,
          Key: { PK: { S: `PACKAGE#${name}` }, SK: { S: 'METADATA' } },
        })
        existingItem = retry.Item
      }
    }
    if (existingItem) {
      // Compare-and-set on updatedAt so concurrent publishes can't clobber
      // each other's latestVersion/searchText. Retry once on contention.
      const existingData = DynamoDBClient.unmarshal(existingItem)
      const prevUpdatedAt = existingData.updatedAt || ''

      try {
        await this.db.updateItem({
          TableName: this.tableName,
          Key: {
            PK: { S: `PACKAGE#${name}` },
            SK: { S: 'METADATA' },
          },
          UpdateExpression: 'SET updatedAt = :now, latestVersion = :ver, description = :desc, searchText = :search',
          ConditionExpression: prevUpdatedAt ? 'updatedAt = :prev' : 'attribute_not_exists(updatedAt)',
          ExpressionAttributeValues: {
            ':now': { S: now },
            ':ver': { S: this.isNewerVersion(version, existingData.latestVersion) ? version : existingData.latestVersion },
            ':desc': { S: metadata.description || existingData.description || '' },
            ':search': {
              S: buildSearchText(name, metadata.description || existingData.description, metadata.keywords || existingData.keywords),
            },
            ...(prevUpdatedAt ? { ':prev': { S: prevUpdatedAt } } : {}),
          },
        } as any)
      }
      catch (err) {
        const awsType = (err as { awsType?: string })?.awsType || ''
        if (!awsType.includes('ConditionalCheckFailed')) throw err
        console.warn(`putVersion: retrying ${name}@${version} after concurrent write`)
        const retry = await this.db.getItem({
          TableName: this.tableName,
          Key: { PK: { S: `PACKAGE#${name}` }, SK: { S: 'METADATA' } },
        })
        if (retry.Item) {
          const latest = DynamoDBClient.unmarshal(retry.Item)
          await this.db.updateItem({
            TableName: this.tableName,
            Key: { PK: { S: `PACKAGE#${name}` }, SK: { S: 'METADATA' } },
            UpdateExpression: 'SET updatedAt = :now, latestVersion = :ver, searchText = :search',
            ConditionExpression: 'updatedAt = :prev',
            ExpressionAttributeValues: {
              ':now': { S: now },
              ':ver': { S: this.isNewerVersion(version, latest.latestVersion) ? version : latest.latestVersion },
              ':search': {
                S: buildSearchText(name, metadata.description || latest.description, metadata.keywords || latest.keywords),
              },
              ':prev': { S: latest.updatedAt || '' },
            },
          } as any)
        }
      }
    }

    // Put version
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `PACKAGE#${name}`,
        SK: `VERSION#${version}`,
        version,
        tarballUrl: metadata.tarballUrl || '',
        checksum: metadata.checksum || '',
        publishedAt: metadata.publishedAt || now,
        size: metadata.size || 0,
      }),
    })
  }

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    const lowerQuery = query.toLowerCase()
    const safeLimit = Math.max(1, Math.min(limit, 50))

    // Paginate the scan so results aren't silently truncated at the 1 MB
    // response boundary. Cap total pages defensively.
    const results: SearchResult[] = []
    let lastKey: Record<string, any> | undefined
    for (let page = 0; page < 10 && results.length < safeLimit * 4; page++) {
      const result: { Items: Array<Record<string, any>>, LastEvaluatedKey?: Record<string, any> } = await this.db.scan({
        TableName: this.tableName,
        FilterExpression: 'SK = :metadata AND contains(searchText, :query)',
        ExpressionAttributeValues: {
          ':metadata': { S: 'METADATA' },
          ':query': { S: lowerQuery },
        },
        Limit: 100,
        ExclusiveStartKey: lastKey,
      } as any)
      for (const item of result.Items) {
        const data = DynamoDBClient.unmarshal(item)
        results.push({
          name: data.name,
          version: data.latestVersion,
          description: data.description,
          keywords: data.keywords,
          author: data.author,
          downloads: data.totalDownloads || 0,
        })
      }
      if (!result.LastEvaluatedKey) break
      lastKey = result.LastEvaluatedKey
    }

    results.sort((a, b) => b.downloads - a.downloads)
    return results.slice(0, safeLimit)
  }

  async listVersions(name: string): Promise<string[]> {
    const result = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': { S: `PACKAGE#${name}` },
        ':prefix': { S: 'VERSION#' },
      },
    })

    const versions = result.Items.map((item) => {
      const data = DynamoDBClient.unmarshal(item)
      return data.version as string
    }).filter(Boolean)

    // Bind explicitly so `this` is preserved in the sort callback.
    return versions.sort((a, b) => this.compareSemver(a, b))
  }

  async incrementDownloads(name: string, _version: string): Promise<void> {
    await this.db.updateItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${name}` },
        SK: { S: 'METADATA' },
      },
      UpdateExpression: 'SET totalDownloads = if_not_exists(totalDownloads, :zero) + :one',
      ExpressionAttributeValues: {
        ':zero': { N: '0' },
        ':one': { N: '1' },
      },
    })
  }

  /**
   * Check if package exists
   */
  async exists(name: string, version: string): Promise<boolean> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${name}` },
        SK: { S: `VERSION#${version}` },
      },
    })

    return result.Item !== undefined
  }

  // ===========================================================================
  // Commit Publish Operations
  // ===========================================================================

  async putCommitPublish(publish: CommitPublish): Promise<void> {
    const now = new Date().toISOString()

    // Primary record: COMMIT#{sha} / PACKAGE#{name}
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `COMMIT#${publish.sha}`,
        SK: `PACKAGE#${publish.name}`,
        name: publish.name,
        sha: publish.sha,
        tarballUrl: publish.tarballUrl,
        checksum: publish.checksum,
        publishedAt: publish.publishedAt || now,
        repository: publish.repository || '',
        packageDir: publish.packageDir || '',
        version: publish.version || '',
        size: publish.size || 0,
      }),
    })

    // Reverse lookup: COMMIT_PACKAGE#{name} / SHA#{sha}
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `COMMIT_PACKAGE#${publish.name}`,
        SK: `SHA#${publish.sha}`,
        name: publish.name,
        sha: publish.sha,
        tarballUrl: publish.tarballUrl,
        publishedAt: publish.publishedAt || now,
        repository: publish.repository || '',
      }),
    })
  }

  async getCommitPublish(sha: string, name: string): Promise<CommitPublish | null> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `COMMIT#${sha}` },
        SK: { S: `PACKAGE#${name}` },
      },
    })

    if (!result.Item) {
      return null
    }

    const data = DynamoDBClient.unmarshal(result.Item)
    return {
      name: data.name,
      sha: data.sha,
      tarballUrl: data.tarballUrl,
      checksum: data.checksum,
      publishedAt: data.publishedAt,
      repository: data.repository,
      packageDir: data.packageDir,
      version: data.version,
      size: data.size,
    }
  }

  async getCommitPackages(sha: string): Promise<CommitPublish[]> {
    const result = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': { S: `COMMIT#${sha}` },
        ':prefix': { S: 'PACKAGE#' },
      },
    })

    return result.Items.map((item) => {
      const data = DynamoDBClient.unmarshal(item)
      return {
        name: data.name,
        sha: data.sha,
        tarballUrl: data.tarballUrl,
        checksum: data.checksum,
        publishedAt: data.publishedAt,
        repository: data.repository,
        packageDir: data.packageDir,
        version: data.version,
        size: data.size,
      }
    })
  }

  async getPackageCommits(name: string, limit = 20): Promise<CommitPublish[]> {
    const result = await this.db.query({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': { S: `COMMIT_PACKAGE#${name}` },
        ':prefix': { S: 'SHA#' },
      },
      ScanIndexForward: false, // newest first
      Limit: limit,
    })

    return result.Items.map((item) => {
      const data = DynamoDBClient.unmarshal(item)
      return {
        name: data.name,
        sha: data.sha,
        tarballUrl: data.tarballUrl,
        checksum: data.checksum || '',
        publishedAt: data.publishedAt,
        repository: data.repository,
      }
    })
  }

  // ===========================================================================
  // Paywall Operations
  // ===========================================================================

  async getPaywall(name: string): Promise<PackagePaywall | null> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `PACKAGE#${name}` },
        SK: { S: 'PAYWALL' },
      },
    })

    if (!result.Item) return null

    const data = DynamoDBClient.unmarshal(result.Item)
    return {
      name: data.name,
      enabled: data.enabled ?? true,
      price: data.price,
      currency: data.currency || 'usd',
      stripeAccountId: data.stripeAccountId,
      stripePriceId: data.stripePriceId,
      stripeProductId: data.stripeProductId,
      freeVersions: data.freeVersions,
      trialDays: data.trialDays,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }
  }

  async putPaywall(paywall: PackagePaywall): Promise<void> {
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `PACKAGE#${paywall.name}`,
        SK: 'PAYWALL',
        name: paywall.name,
        enabled: paywall.enabled,
        price: paywall.price,
        currency: paywall.currency || 'usd',
        stripeAccountId: paywall.stripeAccountId || '',
        stripePriceId: paywall.stripePriceId || '',
        stripeProductId: paywall.stripeProductId || '',
        freeVersions: paywall.freeVersions || [],
        trialDays: paywall.trialDays || 0,
        createdAt: paywall.createdAt,
        updatedAt: paywall.updatedAt,
      }),
    })
  }

  async deletePaywall(name: string): Promise<void> {
    // Disable the paywall by setting enabled=false (DynamoDB client doesn't expose deleteItem)
    const existing = await this.getPaywall(name)
    if (existing) {
      existing.enabled = false
      existing.updatedAt = new Date().toISOString()
      await this.putPaywall(existing)
    }
  }

  async getAccessGrant(packageName: string, token: string): Promise<PackageAccessGrant | null> {
    const result = await this.db.getItem({
      TableName: this.tableName,
      Key: {
        PK: { S: `ACCESS#${packageName}` },
        SK: { S: `TOKEN#${token}` },
      },
    })

    if (!result.Item) return null

    const data = DynamoDBClient.unmarshal(result.Item)

    // Check if access has expired
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return null
    }

    return {
      packageName: data.packageName,
      token: data.token,
      stripePaymentId: data.stripePaymentId || undefined,
      grantedAt: data.grantedAt,
      expiresAt: data.expiresAt || undefined,
    }
  }

  async putAccessGrant(grant: PackageAccessGrant): Promise<void> {
    await this.db.putItem({
      TableName: this.tableName,
      Item: DynamoDBClient.marshal({
        PK: `ACCESS#${grant.packageName}`,
        SK: `TOKEN#${grant.token}`,
        packageName: grant.packageName,
        token: grant.token,
        stripePaymentId: grant.stripePaymentId || '',
        grantedAt: grant.grantedAt,
        expiresAt: grant.expiresAt || '',
      }),
    })
  }

  private isNewerVersion(a: string, b: string): boolean {
    const parse = (v: string) => {
      const dashIdx = v.indexOf('-')
      const numeric = (dashIdx === -1 ? v : v.slice(0, dashIdx)).split('.').map(s => {
        const n = Number.parseInt(s, 10)
        return Number.isNaN(n) ? 0 : n
      })
      const prerelease = dashIdx === -1 ? null : v.slice(dashIdx + 1)
      return { numeric, prerelease }
    }
    const pa = parse(a)
    const pb = parse(b)
    const len = Math.max(pa.numeric.length, pb.numeric.length)
    for (let i = 0; i < len; i++) {
      const av = pa.numeric[i] ?? 0
      const bv = pb.numeric[i] ?? 0
      if (av !== bv) return av > bv
    }
    if (pa.prerelease === null && pb.prerelease !== null) return true
    if (pa.prerelease !== null && pb.prerelease === null) return false
    if (pa.prerelease !== null && pb.prerelease !== null) return pa.prerelease > pb.prerelease
    return false
  }

  private compareSemver(a: string, b: string): number {
    if (this.isNewerVersion(a, b)) return -1
    if (this.isNewerVersion(b, a)) return 1
    return 0
  }
}

/**
 * Create DynamoDB metadata storage
 */
export function createDynamoDBMetadataStorage(tableName: string, region = 'us-east-1'): MetadataStorage {
  return new DynamoDBMetadataStorage(tableName, region)
}
