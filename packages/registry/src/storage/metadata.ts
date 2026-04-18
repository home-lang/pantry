import type {
  CommitPublish,
  MetadataStorage,
  PackageAccessGrant,
  PackageMetadata,
  PackagePaywall,
  PackageRecord,
  SearchResult,
} from '../types'

/**
 * In-memory metadata storage for development/testing
 * Replace with DynamoDB for production
 */
export class InMemoryMetadataStorage implements MetadataStorage {
  private packages: Map<string, PackageRecord> = new Map()
  private paywalls: Map<string, PackagePaywall> = new Map()
  private accessGrants: Map<string, PackageAccessGrant> = new Map()

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

    // Bind the comparator explicitly — `.sort(this.compareSemver)` would
    // invoke it with `this === undefined`, silently collapsing to a string
    // compare and mis-ordering versions.
    return Object.keys(pkg.versions).sort((a, b) => this.compareSemver(a, b))
  }

  async incrementDownloads(name: string, _version: string): Promise<void> {
    const pkg = this.packages.get(name)
    if (pkg) {
      pkg.totalDownloads++
      this.packages.set(name, pkg)
    }
  }

  // Commit publish operations (in-memory)
  private commits: Map<string, CommitPublish[]> = new Map()
  private packageCommits: Map<string, CommitPublish[]> = new Map()

  async putCommitPublish(publish: CommitPublish): Promise<void> {
    const key = publish.sha
    const existing = this.commits.get(key) || []
    // Replace if same name already exists for this sha
    const filtered = existing.filter(p => p.name !== publish.name)
    filtered.push(publish)
    this.commits.set(key, filtered)

    // Reverse lookup
    const pkgKey = publish.name
    const pkgExisting = this.packageCommits.get(pkgKey) || []
    const pkgFiltered = pkgExisting.filter(p => p.sha !== publish.sha)
    pkgFiltered.push(publish)
    this.packageCommits.set(pkgKey, pkgFiltered)
  }

  async getCommitPublish(sha: string, name: string): Promise<CommitPublish | null> {
    const packages = this.commits.get(sha)
    if (!packages)
      return null
    return packages.find(p => p.name === name) || null
  }

  async getCommitPackages(sha: string): Promise<CommitPublish[]> {
    return this.commits.get(sha) || []
  }

  async getPackageCommits(name: string, limit = 20): Promise<CommitPublish[]> {
    const commits = this.packageCommits.get(name) || []
    return commits.slice(-limit).reverse()
  }

  /**
   * Simple semver comparison
   */
  async getPaywall(name: string): Promise<PackagePaywall | null> {
    const paywall = this.paywalls.get(name)
    if (!paywall || !paywall.enabled) return null
    return paywall
  }

  async putPaywall(paywall: PackagePaywall): Promise<void> {
    this.paywalls.set(paywall.name, paywall)
  }

  async deletePaywall(name: string): Promise<void> {
    const paywall = this.paywalls.get(name)
    if (paywall) {
      paywall.enabled = false
      paywall.updatedAt = new Date().toISOString()
    }
  }

  async getAccessGrant(packageName: string, token: string): Promise<PackageAccessGrant | null> {
    const key = `${packageName}:${token}`
    const grant = this.accessGrants.get(key)
    if (!grant) return null
    if (grant.expiresAt && new Date(grant.expiresAt) < new Date()) return null
    return grant
  }

  async putAccessGrant(grant: PackageAccessGrant): Promise<void> {
    const key = `${grant.packageName}:${grant.token}`
    this.accessGrants.set(key, grant)
  }

  private parseSemver(v: string): { numeric: number[], prerelease: string | null } {
    const dashIdx = v.indexOf('-')
    const numeric = (dashIdx === -1 ? v : v.slice(0, dashIdx))
      .split('.').map(s => {
        const n = Number.parseInt(s, 10)
        return Number.isNaN(n) ? 0 : n
      })
    const prerelease = dashIdx === -1 ? null : v.slice(dashIdx + 1)
    return { numeric, prerelease }
  }

  private isNewerVersion(a: string, b: string): boolean {
    const pa = this.parseSemver(a)
    const pb = this.parseSemver(b)
    const len = Math.max(pa.numeric.length, pb.numeric.length)
    for (let i = 0; i < len; i++) {
      const av = pa.numeric[i] ?? 0
      const bv = pb.numeric[i] ?? 0
      if (av !== bv) return av > bv
    }
    // Same numeric: release (no prerelease) is newer than prerelease
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
    const file = Bun.file(this.filePath)
    if (!(await file.exists())) return
    try {
      const data = await file.json()
      if (!data || typeof data !== 'object') {
        console.warn(`FileMetadataStorage: ${this.filePath} is not an object; starting empty`)
        return
      }
      this.import(data)
    }
    catch (err) {
      // Previously swallowed silently — a malformed metadata.json would cause
      // invisible data loss. Log loudly but still start empty so a restart
      // isn't blocked by a corrupt file.
      console.error(`FileMetadataStorage: failed to load ${this.filePath}: ${(err as Error).message}. Starting empty; existing file NOT overwritten until next save.`)
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout)
      clearTimeout(this.saveTimeout)

    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null
      this.save().catch(err => console.error('FileMetadataStorage save failed:', (err as Error).message))
    }, 1000)
  }

  // Guard against concurrent saves overwriting each other.
  private savePromise: Promise<void> | null = null

  private async save(): Promise<void> {
    // Serialize saves so a long write can't be overtaken by a newer one.
    while (this.savePromise) await this.savePromise
    this.savePromise = this._doSave()
    try {
      await this.savePromise
    }
    finally {
      this.savePromise = null
    }
  }

  private async _doSave(): Promise<void> {
    const data = this.export()
    const payload = JSON.stringify(data, null, 2)
    // Write to a temp file then rename — `rename(2)` is atomic on POSIX, so
    // a crash during write can't leave a half-written metadata file.
    const tmpPath = `${this.filePath}.tmp.${process.pid}.${Date.now()}`
    await Bun.write(tmpPath, payload)
    const fs = await import('node:fs/promises')
    await fs.rename(tmpPath, this.filePath)
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
