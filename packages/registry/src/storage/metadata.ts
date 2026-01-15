import type {
  MetadataStorage,
  PackageMetadata,
  PackageRecord,
  SearchResult,
} from '../types'

/**
 * In-memory metadata storage for development/testing
 * Replace with DynamoDB for production
 */
export class InMemoryMetadataStorage implements MetadataStorage {
  private packages: Map<string, PackageRecord> = new Map()

  async getPackage(name: string): Promise<PackageRecord | null> {
    return this.packages.get(name) || null
  }

  async getPackageVersion(name: string, version: string): Promise<PackageMetadata | null> {
    const pkg = this.packages.get(name)
    if (!pkg)
      return null

    const versionInfo = pkg.versions[version]
    if (!versionInfo)
      return null

    return {
      name: pkg.name,
      version,
      description: pkg.description,
      repository: pkg.repository,
      homepage: pkg.homepage,
      license: pkg.license,
      author: pkg.author,
      keywords: pkg.keywords,
      tarballUrl: versionInfo.tarballUrl,
      checksum: versionInfo.checksum,
      publishedAt: versionInfo.publishedAt,
    }
  }

  async putPackage(record: PackageRecord): Promise<void> {
    this.packages.set(record.name, record)
  }

  async putVersion(name: string, version: string, metadata: PackageMetadata): Promise<void> {
    let pkg = this.packages.get(name)

    if (!pkg) {
      pkg = {
        name,
        description: metadata.description,
        repository: metadata.repository,
        homepage: metadata.homepage,
        license: metadata.license,
        author: metadata.author,
        keywords: metadata.keywords,
        versions: {},
        latestVersion: version,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalDownloads: 0,
      }
    }

    pkg.versions[version] = {
      version,
      tarballUrl: metadata.tarballUrl || '',
      checksum: metadata.checksum || '',
      publishedAt: metadata.publishedAt || new Date().toISOString(),
      size: 0,
    }

    // Update latest version (simple semver comparison)
    if (this.isNewerVersion(version, pkg.latestVersion)) {
      pkg.latestVersion = version
    }

    pkg.updatedAt = new Date().toISOString()
    pkg.description = metadata.description || pkg.description
    pkg.repository = metadata.repository || pkg.repository
    pkg.homepage = metadata.homepage || pkg.homepage
    pkg.license = metadata.license || pkg.license
    pkg.author = metadata.author || pkg.author
    pkg.keywords = metadata.keywords || pkg.keywords

    this.packages.set(name, pkg)
  }

  async search(query: string, limit = 20): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    for (const pkg of this.packages.values()) {
      const matchesName = pkg.name.toLowerCase().includes(lowerQuery)
      const matchesDesc = pkg.description?.toLowerCase().includes(lowerQuery) || false
      const matchesKeywords = pkg.keywords?.some(k => k.toLowerCase().includes(lowerQuery)) || false

      if (matchesName || matchesDesc || matchesKeywords) {
        results.push({
          name: pkg.name,
          version: pkg.latestVersion,
          description: pkg.description,
          keywords: pkg.keywords,
          author: pkg.author,
          downloads: pkg.totalDownloads,
        })

        if (results.length >= limit)
          break
      }
    }

    // Sort by downloads (popularity)
    results.sort((a, b) => b.downloads - a.downloads)
    return results
  }

  async listVersions(name: string): Promise<string[]> {
    const pkg = this.packages.get(name)
    if (!pkg)
      return []

    return Object.keys(pkg.versions).sort(this.compareSemver)
  }

  async incrementDownloads(name: string, _version: string): Promise<void> {
    const pkg = this.packages.get(name)
    if (pkg) {
      pkg.totalDownloads++
      this.packages.set(name, pkg)
    }
  }

  /**
   * Simple semver comparison
   */
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

  /**
   * Export all data (for persistence)
   */
  export(): Record<string, PackageRecord> {
    const data: Record<string, PackageRecord> = {}
    for (const [name, pkg] of this.packages) {
      data[name] = pkg
    }
    return data
  }

  /**
   * Import data (for restoring from persistence)
   */
  import(data: Record<string, PackageRecord>): void {
    for (const [name, pkg] of Object.entries(data)) {
      this.packages.set(name, pkg)
    }
  }
}

/**
 * File-based metadata storage for simple persistence
 */
export class FileMetadataStorage extends InMemoryMetadataStorage {
  private filePath: string
  private saveTimeout: Timer | null = null

  constructor(filePath: string) {
    super()
    this.filePath = filePath
    this.load()
  }

  private async load(): Promise<void> {
    try {
      const file = Bun.file(this.filePath)
      if (await file.exists()) {
        const data = await file.json()
        this.import(data)
      }
    }
    catch {
      // File doesn't exist or is invalid, start fresh
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout)
      clearTimeout(this.saveTimeout)

    this.saveTimeout = setTimeout(() => {
      this.save()
    }, 1000)
  }

  private async save(): Promise<void> {
    const data = this.export()
    await Bun.write(this.filePath, JSON.stringify(data, null, 2))
  }

  async putPackage(record: PackageRecord): Promise<void> {
    await super.putPackage(record)
    this.scheduleSave()
  }

  async putVersion(name: string, version: string, metadata: PackageMetadata): Promise<void> {
    await super.putVersion(name, version, metadata)
    this.scheduleSave()
  }

  async incrementDownloads(name: string, version: string): Promise<void> {
    await super.incrementDownloads(name, version)
    this.scheduleSave()
  }
}
