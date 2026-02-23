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
  PackageMetadata,
  PackageRecord,
  SearchResult,
} from '../types'
import { DynamoDBClient } from './dynamodb-client'

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
        searchText: [
          record.name,
          record.description,
          ...(record.keywords || []),
        ].filter(Boolean).join(' ').toLowerCase(),
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

    if (!existing.Item) {
      // Create new package
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
          searchText: [
            name,
            metadata.description,
            ...(metadata.keywords || []),
          ].filter(Boolean).join(' ').toLowerCase(),
        }),
      })
    }
    else {
      // Update existing package
      const existingData = DynamoDBClient.unmarshal(existing.Item)

      await this.db.updateItem({
        TableName: this.tableName,
        Key: {
          PK: { S: `PACKAGE#${name}` },
          SK: { S: 'METADATA' },
        },
        UpdateExpression: 'SET updatedAt = :now, latestVersion = :ver, description = :desc, searchText = :search',
        ExpressionAttributeValues: {
          ':now': { S: now },
          ':ver': { S: this.isNewerVersion(version, existingData.latestVersion) ? version : existingData.latestVersion },
          ':desc': { S: metadata.description || existingData.description || '' },
          ':search': {
            S: [
              name,
              metadata.description || existingData.description,
              ...(metadata.keywords || existingData.keywords || []),
            ].filter(Boolean).join(' ').toLowerCase(),
          },
        },
      })
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
        size: 0,
      }),
    })
  }

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    const lowerQuery = query.toLowerCase()

    // Scan for packages matching the query
    // In production with lots of packages, use OpenSearch/Elasticsearch or a GSI
    const result = await this.db.scan({
      TableName: this.tableName,
      FilterExpression: 'SK = :metadata AND contains(searchText, :query)',
      ExpressionAttributeValues: {
        ':metadata': { S: 'METADATA' },
        ':query': { S: lowerQuery },
      },
      Limit: limit * 2, // Get extra to account for filtering
    })

    const results: SearchResult[] = result.Items.map((item) => {
      const data = DynamoDBClient.unmarshal(item)
      return {
        name: data.name,
        version: data.latestVersion,
        description: data.description,
        keywords: data.keywords,
        author: data.author,
        downloads: data.totalDownloads || 0,
      }
    })

    // Sort by downloads and limit
    results.sort((a, b) => b.downloads - a.downloads)
    return results.slice(0, limit)
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
    })

    return versions.sort(this.compareSemver)
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
        checksum: '',
        publishedAt: data.publishedAt,
        repository: data.repository,
      }
    })
  }

  private isNewerVersion(a: string, b: string): boolean {
    const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
    const [bMajor, bMinor, bPatch] = b.split('.').map(Number)

    if (aMajor !== bMajor)
      return aMajor > bMajor
    if (aMinor !== bMinor)
      return aMinor > bMinor
    return aPatch > bPatch
  }

  private compareSemver(a: string, b: string): number {
    const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
    const [bMajor, bMinor, bPatch] = b.split('.').map(Number)

    if (aMajor !== bMajor)
      return bMajor - aMajor
    if (aMinor !== bMinor)
      return bMinor - aMinor
    return bPatch - aPatch
  }
}

/**
 * Create DynamoDB metadata storage
 */
export function createDynamoDBMetadataStorage(tableName: string, region = 'us-east-1'): MetadataStorage {
  return new DynamoDBMetadataStorage(tableName, region)
}
