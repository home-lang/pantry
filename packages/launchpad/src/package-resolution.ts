import type { PackageAlias, PackageDomain, PackageName } from './types'
import { aliases, packages } from 'ts-pkgx'
import { config } from './config'

/**
 * Resolves a package name to its canonical domain using ts-pkgx aliases
 * with fallback support for common package names
 */
export function resolvePackageName(packageName: string): string {
  // First check for known incorrect aliases that need to be overridden
  const overrideAliases: Record<string, string> = {
    // ts-pkgx correctly maps git to git-scm.com, so no override needed
  }

  if (overrideAliases[packageName]) {
    return overrideAliases[packageName]
  }

  // Then try the official ts-pkgx aliases
  const aliasResult = (aliases as Record<string, string>)[packageName]
  if (aliasResult) {
    return aliasResult
  }

  // Fallback mapping for common packages that don't have official aliases
  const commonAliases: Record<string, string> = {
    // Database systems
    mysql: 'mysql.com',
    mariadb: 'mariadb.com/server',
    postgresql: 'postgresql.org',
    postgres: 'postgresql.org',
    redis: 'redis.io',
    mongodb: 'mongodb.com',
    sqlite: 'sqlite.org',
    cassandra: 'cassandra.apache.org',
    influxdb: 'influxdata.com',
    couchdb: 'couchdb.apache.org',
    neo4j: 'neo4j.com',
    clickhouse: 'clickhouse.com',
    duckdb: 'duckdb.org',
    valkey: 'valkey.io',

    // Programming languages and runtimes
    node: 'nodejs.org',
    nodejs: 'nodejs.org',
    python: 'python.org',
    python3: 'python.org',
    php: 'php.net',
    ruby: 'ruby-lang.org',
    rust: 'rust-lang.org',
    go: 'go.dev',
    golang: 'go.dev',
    java: 'openjdk.org',
    openjdk: 'openjdk.org',
    deno: 'deno.land',
    bun: 'bun.sh',

    // Package managers
    npm: 'npmjs.com',
    yarn: 'yarnpkg.com',
    pnpm: 'pnpm.io',
    pip: 'pip.pypa.io',
    composer: 'getcomposer.org',
    poetry: 'python-poetry.org',
    pipenv: 'pipenv.pypa.io',
    gem: 'rubygems.org',
    cargo: 'crates.io',
    maven: 'maven.apache.org',
    gradle: 'gradle.org',

    // Development tools
    docker: 'docker.com',
    kubectl: 'kubernetes.io/kubectl',
    helm: 'helm.sh',
    terraform: 'terraform.io',
    ansible: 'ansible.com',
    curl: 'curl.se',
    wget: 'gnu.org/wget',
    nginx: 'nginx.org',
    apache: 'apache.org',
    vim: 'vim.org',
    neovim: 'neovim.io',
    nvim: 'neovim.io',
    code: 'code.visualstudio.com',
    vscode: 'code.visualstudio.com',

    // Cloud and deployment
    aws: 'aws.amazon.com',
    gcloud: 'cloud.google.com',
    azure: 'azure.microsoft.com',
    heroku: 'heroku.com',
    vercel: 'vercel.com',
    netlify: 'netlify.com',

    // Build tools and compilers
    cmake: 'cmake.org',
    make: 'gnu.org/make',
    gcc: 'gnu.org/gcc',
    clang: 'llvm.org',
    llvm: 'llvm.org',

    // Search engines
    meilisearch: 'meilisearch.com',

    // Web servers and proxies
    traefik: 'traefik.io',
    caddy: 'caddy.dev',
    haproxy: 'haproxy.org',

    // CLI utilities
    jq: 'jqlang.github.io',
    yq: 'mikefarah.gitbook.io/yq',
    htop: 'htop.dev',
    tree: 'tree.dev',
    ripgrep: 'github.com/BurntSushi/ripgrep',
    rg: 'github.com/BurntSushi/ripgrep',
    fd: 'github.com/sharkdp/fd',
    bat: 'github.com/sharkdp/bat',
    exa: 'the.exa.website',
    fzf: 'github.com/junegunn/fzf',
  }

  // Check fallback aliases
  const fallbackResult = commonAliases[packageName.toLowerCase()]
  if (fallbackResult) {
    return fallbackResult
  }

  // If no alias found, return the original package name
  return packageName
}

/**
 * Gets the latest version for a package
 */
export function getLatestVersion(packageName: string): string | null {
  const domain = resolvePackageName(packageName)

  // First, try to find the package by iterating through all packages and matching the domain
  for (const [_, pkg] of Object.entries(packages)) {
    if ('domain' in pkg && pkg.domain === domain) {
      if ('versions' in pkg && Array.isArray(pkg.versions) && pkg.versions.length > 0) {
        const version = pkg.versions[0] // versions[0] is always the latest
        // Ensure version is a string to prevent [object Object] errors
        return typeof version === 'string' ? version : String(version)
      }
      break
    }
  }

  // Fallback to the old logic for packages that might not have explicit domains
  const domainKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase() as keyof typeof packages
  const pkg = packages[domainKey]

  if (pkg && 'versions' in pkg && Array.isArray(pkg.versions) && pkg.versions.length > 0) {
    const version = pkg.versions[0] // versions[0] is always the latest
    // Ensure version is a string to prevent [object Object] errors
    return typeof version === 'string' ? version : String(version)
  }

  return null
}

/**
 * Gets all available versions for a package
 */
export function getAvailableVersions(packageName: string): string[] {
  const domain = resolvePackageName(packageName)

  // First, try to find the package by iterating through all packages and matching the domain
  for (const [_, pkg] of Object.entries(packages)) {
    if ('domain' in pkg && pkg.domain === domain) {
      if ('versions' in pkg && Array.isArray(pkg.versions)) {
        // Ensure all versions are strings to prevent [object Object] errors
        return pkg.versions.map((v: any) => typeof v === 'string' ? v : String(v))
      }
      break
    }
  }

  // Fallback to the old logic for packages that might not have explicit domains
  const domainKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase() as keyof typeof packages
  const pkg = packages[domainKey]

  if (pkg && 'versions' in pkg && Array.isArray(pkg.versions)) {
    // Ensure all versions are strings to prevent [object Object] errors
    return pkg.versions.map((v: any) => typeof v === 'string' ? v : String(v))
  }

  return []
}

/**
 * Checks if a specific version exists for a package
 */
export function isVersionAvailable(packageName: string, version: string): boolean {
  const versions = getAvailableVersions(packageName)
  return versions.includes(version)
}

/**
 * Resolves a version specification to an actual version
 * @param packageName - The package name or alias
 * @param versionSpec - Version specification (e.g., "latest", "^20", "20.1.0", etc.)
 * @returns The resolved version or null if not found
 */
export function resolveVersion(packageName: string, versionSpec?: string): string | null {
  const versions = getAvailableVersions(packageName)

  if (!versions.length) {
    return null
  }

  // If no version specified, "latest", or "*", return the latest version
  if (!versionSpec || versionSpec === 'latest' || versionSpec === '*') {
    return versions[0] // versions[0] is always the latest
  }

  // If exact version specified, check if it exists
  if (versions.includes(versionSpec)) {
    return versionSpec
  }

  // Try Bun's semver first, but don't rely on it exclusively
  let bunSemverResult: string | null = null
  if (typeof Bun !== 'undefined' && Bun.semver) {
    try {
      // Find the best matching version using Bun's semver.satisfies
      // Sort versions in descending order to get the latest compatible version first
      const sortedVersions = [...versions].sort((a, b) => {
        try {
          return Bun.semver.order(b, a)
        }
        catch {
          // Fallback to string comparison if Bun.semver.order fails
          return b.localeCompare(a, undefined, { numeric: true })
        }
      })

      for (const version of sortedVersions) {
        try {
          if (Bun.semver.satisfies(version, versionSpec)) {
            bunSemverResult = version
            break
          }
        }
        catch {
          // Skip individual version if it can't be parsed by Bun.semver
          // This handles cases like "1.1.1w" that aren't standard semver
          continue
        }
      }
    }
    catch (error) {
      // Fallback to manual parsing if Bun.semver fails
      if (config.verbose) {
        console.warn(`Bun.semver failed for ${versionSpec}, falling back to manual parsing: ${error}`)
      }
    }
  }

  // Enhanced manual semver-like parsing for non-Bun environments or when Bun.semver fails
  let manualResult: string | null = null

  if (versionSpec.startsWith('^')) {
    const baseVersion = versionSpec.slice(1)
    const [major, minor, patch] = baseVersion.split('.')

    // For caret ranges, find the latest version compatible with the major version
    // ^1.21 means >=1.21.0 <2.0.0
    // ^1.21.3 means >=1.21.3 <2.0.0
    // ^3.0 means >=3.0.0 <4.0.0

    // Sort versions to get the latest compatible one first
    const sortedVersions = [...versions].sort((a, b) => {
      // Simple numeric comparison fallback
      const aParts = a.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const bParts = b.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      // Compare major.minor.patch
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0
        const bVal = bParts[i] || 0
        if (aVal !== bVal) {
          return bVal - aVal // Descending order
        }
      }
      return 0
    })

    manualResult = sortedVersions.find((v) => {
      // Handle non-standard version formats by extracting numeric parts
      const versionParts = v.split('.')
      if (versionParts.length < 1)
        return false

      const vMajor = versionParts[0]
      const vMinor = versionParts[1] || '0'
      const vPatch = versionParts[2] || '0'

      // Must have same major version
      if (vMajor !== major)
        return false

      // If only major specified (e.g., ^3), any version with same major works
      if (!minor || minor === '0') {
        return true
      }

      // If minor specified, check minor version constraint
      // Extract numeric part from version components to handle suffixes like "1w"
      const vMinorNum = Number.parseInt(vMinor || '0', 10)
      const minorNum = Number.parseInt(minor, 10)

      // Skip if we can't parse the version numbers
      if (Number.isNaN(vMinorNum) || Number.isNaN(minorNum))
        return false

      // Minor version must be >= specified minor
      if (vMinorNum < minorNum)
        return false

      // If patch specified, check patch version constraint when minor versions are equal
      if (patch && vMinorNum === minorNum) {
        // Extract numeric part from patch version to handle suffixes
        const vPatchNum = Number.parseInt(vPatch || '0', 10)
        const patchNum = Number.parseInt(patch, 10)

        // Skip if we can't parse the patch numbers
        if (Number.isNaN(vPatchNum) || Number.isNaN(patchNum))
          return false

        return vPatchNum >= patchNum
      }

      return true
    }) || null
  }

  if (versionSpec.startsWith('~')) {
    const baseVersion = versionSpec.slice(1)
    const [major, minor, patch] = baseVersion.split('.')

    // Tilde constraint: ~1.2.3 means >=1.2.3 <1.3.0, ~1.2 means >=1.2.0 <1.3.0
    // Sort versions to get the latest compatible one first
    const sortedVersions = [...versions].sort((a, b) => {
      const aParts = a.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const bParts = b.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0
        const bVal = bParts[i] || 0
        if (aVal !== bVal) {
          return bVal - aVal // Descending order
        }
      }
      return 0
    })

    manualResult = sortedVersions.find((v) => {
      const versionParts = v.split('.')
      if (versionParts.length < 2)
        return false

      const vMajor = versionParts[0]
      const vMinor = versionParts[1]
      const vPatch = versionParts[2] || '0'

      // Must have same major version
      if (vMajor !== major)
        return false

      // Must have same minor version
      if (vMinor !== minor)
        return false

      // If patch is specified, check patch version constraint
      if (patch) {
        // Extract numeric part from patch version to handle suffixes
        const vPatchNum = Number.parseInt(vPatch || '0', 10)
        const patchNum = Number.parseInt(patch, 10)

        // Skip if we can't parse the patch numbers
        if (Number.isNaN(vPatchNum) || Number.isNaN(patchNum))
          return false

        // Patch version must be >= specified patch
        return vPatchNum >= patchNum
      }

      // If no patch specified, any patch version is acceptable
      return true
    }) || null
  }

  // Return Bun.semver result if available, otherwise use manual result
  if (bunSemverResult) {
    return bunSemverResult
  }

  if (manualResult) {
    return manualResult
  }

  // Handle range specifications like "1.0.0 - 2.0.0"
  if (versionSpec.includes(' - ')) {
    if (typeof Bun !== 'undefined' && Bun.semver) {
      try {
        const sortedVersions = [...versions].sort((a, b) => {
          try {
            return Bun.semver.order(b, a)
          }
          catch {
            return b.localeCompare(a, undefined, { numeric: true })
          }
        })
        for (const version of sortedVersions) {
          try {
            if (Bun.semver.satisfies(version, versionSpec)) {
              return version
            }
          }
          catch {
            // Skip versions that can't be parsed
            continue
          }
        }
      }
      catch {
        // Fallback to simple string comparison
      }
    }

    const [minVersion, maxVersion] = versionSpec.split(' - ')
    const matchingVersion = versions.find((v) => {
      // Simple string comparison - for proper semver, this would need more logic
      return v >= minVersion && v <= maxVersion
    })
    return matchingVersion || null
  }

  // Handle >= constraints (e.g., >=10.30)
  if (versionSpec.startsWith('>=')) {
    const minVersion = versionSpec.slice(2)
    // Sort versions to get the latest compatible one first
    const sortedVersions = [...versions].sort((a, b) => {
      const aParts = a.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const bParts = b.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0
        const bVal = bParts[i] || 0
        if (aVal !== bVal) {
          return bVal - aVal // Descending order
        }
      }
      return 0
    })

    const matchingVersion = sortedVersions.find((v) => {
      // Compare versions numerically
      const vParts = v.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const minParts = minVersion.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      // Compare major.minor.patch
      for (let i = 0; i < Math.max(vParts.length, minParts.length); i++) {
        const vVal = vParts[i] || 0
        const minVal = minParts[i] || 0
        if (vVal !== minVal) {
          return vVal >= minVal
        }
      }
      return true // Equal versions satisfy >=
    })
    return matchingVersion || null
  }

  // Handle <= constraints (e.g., <=10.30)
  if (versionSpec.startsWith('<=')) {
    const maxVersion = versionSpec.slice(2)
    // Sort versions to get the latest compatible one first
    const sortedVersions = [...versions].sort((a, b) => {
      const aParts = a.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const bParts = b.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0
        const bVal = bParts[i] || 0
        if (aVal !== bVal) {
          return bVal - aVal // Descending order
        }
      }
      return 0
    })

    const matchingVersion = sortedVersions.find((v) => {
      // Compare versions numerically
      const vParts = v.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const maxParts = maxVersion.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      // Compare major.minor.patch
      for (let i = 0; i < Math.max(vParts.length, maxParts.length); i++) {
        const vVal = vParts[i] || 0
        const maxVal = maxParts[i] || 0
        if (vVal !== maxVal) {
          return vVal <= maxVal
        }
      }
      return true // Equal versions satisfy <=
    })
    return matchingVersion || null
  }

  // Handle > constraints (e.g., >10.30)
  if (versionSpec.startsWith('>') && !versionSpec.startsWith('>=')) {
    const minVersion = versionSpec.slice(1)
    // Sort versions to get the latest compatible one first
    const sortedVersions = [...versions].sort((a, b) => {
      const aParts = a.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const bParts = b.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0
        const bVal = bParts[i] || 0
        if (aVal !== bVal) {
          return bVal - aVal // Descending order
        }
      }
      return 0
    })

    const matchingVersion = sortedVersions.find((v) => {
      // Compare versions numerically
      const vParts = v.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const minParts = minVersion.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      // Compare major.minor.patch
      for (let i = 0; i < Math.max(vParts.length, minParts.length); i++) {
        const vVal = vParts[i] || 0
        const minVal = minParts[i] || 0
        if (vVal !== minVal) {
          return vVal > minVal
        }
      }
      return false // Equal versions do not satisfy >
    })
    return matchingVersion || null
  }

  // Handle < constraints (e.g., <10.30)
  if (versionSpec.startsWith('<') && !versionSpec.startsWith('<=')) {
    const maxVersion = versionSpec.slice(1)
    // Sort versions to get the latest compatible one first
    const sortedVersions = [...versions].sort((a, b) => {
      const aParts = a.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const bParts = b.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0
        const bVal = bParts[i] || 0
        if (aVal !== bVal) {
          return bVal - aVal // Descending order
        }
      }
      return 0
    })

    const matchingVersion = sortedVersions.find((v) => {
      // Compare versions numerically
      const vParts = v.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })
      const maxParts = maxVersion.split('.').map((part) => {
        const num = Number.parseInt(part, 10)
        return Number.isNaN(num) ? 0 : num
      })

      // Compare major.minor.patch
      for (let i = 0; i < Math.max(vParts.length, maxParts.length); i++) {
        const vVal = vParts[i] || 0
        const maxVal = maxParts[i] || 0
        if (vVal !== maxVal) {
          return vVal < maxVal
        }
      }
      return false // Equal versions do not satisfy <
    })
    return matchingVersion || null
  }

  // Handle x.x.x patterns
  if (versionSpec.includes('x') || versionSpec.includes('X')) {
    const pattern = versionSpec.toLowerCase().replace(/x/g, '\\d+')
    const regex = new RegExp(`^${pattern}$`)
    const matchingVersion = versions.find(v => regex.test(v))
    return matchingVersion || null
  }

  // Try to find a version that starts with the spec (for partial matches)
  const matchingVersion = versions.find(v => v.startsWith(versionSpec))
  return matchingVersion || null
}

/**
 * Returns all available package aliases from ts-pkgx
 */
export function listAvailablePackages(): Array<{ name: PackageAlias, domain: string }> {
  const aliasRecord = aliases as Record<string, string>
  return Object.entries(aliasRecord).map(([name, domain]) => ({
    name: name as PackageAlias,
    domain,
  }))
}

/**
 * Checks if a package name is a known alias
 */
export function isPackageAlias(packageName: string): packageName is PackageAlias {
  return packageName in (aliases as Record<string, string>)
}

/**
 * Type guard to check if a string is a valid package domain
 */
export function isPackageDomain(domain: string): domain is PackageDomain {
  const domainKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase()
  return domainKey in packages
}

/**
 * Type guard to check if a string is a valid package name (alias or domain)
 */
export function isValidPackageName(name: string): name is PackageName {
  return isPackageAlias(name) || isPackageDomain(name)
}

/**
 * Type-safe function to get all available package aliases
 */
export function getAllPackageAliases(): PackageAlias[] {
  return Object.keys(aliases) as PackageAlias[]
}

/**
 * Type-safe function to get all available package domains
 */
export function getAllPackageDomains(): PackageDomain[] {
  return Object.keys(packages) as PackageDomain[]
}

/**
 * Type-safe function to get all available package names (aliases + domains)
 */
export function getAllPackageNames(): PackageName[] {
  return [...getAllPackageAliases(), ...getAllPackageDomains()]
}

/**
 * Parse a package specification into name and version
 * Handles both standard format (package@version) and dependency format (domain^version)
 */
export function parsePackageSpec(spec: string): { name: string, version?: string } {
  // First try standard format with @ separator
  const atIndex = spec.lastIndexOf('@')
  if (atIndex !== -1 && atIndex !== 0) {
    const name = spec.slice(0, atIndex)
    const version = spec.slice(atIndex + 1)
    return { name, version: version || undefined }
  }

  // Then try dependency format with >= separator (e.g., pcre.org/v2>=10.30)
  const gteIndex = spec.indexOf('>=')
  if (gteIndex !== -1 && gteIndex !== 0) {
    const name = spec.slice(0, gteIndex)
    const version = spec.slice(gteIndex) // Include the >= in the version
    return { name, version: version || undefined }
  }

  // Then try dependency format with <= separator (e.g., package<=1.0)
  const lteIndex = spec.indexOf('<=')
  if (lteIndex !== -1 && lteIndex !== 0) {
    const name = spec.slice(0, lteIndex)
    const version = spec.slice(lteIndex) // Include the <= in the version
    return { name, version: version || undefined }
  }

  // Then try dependency format with > separator (e.g., package>1.0)
  const gtIndex = spec.indexOf('>')
  if (gtIndex !== -1 && gtIndex !== 0) {
    const name = spec.slice(0, gtIndex)
    const version = spec.slice(gtIndex) // Include the > in the version
    return { name, version: version || undefined }
  }

  // Then try dependency format with < separator (e.g., package<1.0)
  const ltIndex = spec.indexOf('<')
  if (ltIndex !== -1 && ltIndex !== 0) {
    const name = spec.slice(0, ltIndex)
    const version = spec.slice(ltIndex) // Include the < in the version
    return { name, version: version || undefined }
  }

  // Then try dependency format with ^ separator (e.g., openssl.org^1.1)
  const caretIndex = spec.indexOf('^')
  if (caretIndex !== -1 && caretIndex !== 0) {
    const name = spec.slice(0, caretIndex)
    const version = spec.slice(caretIndex) // Include the ^ in the version
    return { name, version: version || undefined }
  }

  // Then try dependency format with ~ separator (e.g., package~1.0)
  const tildeIndex = spec.indexOf('~')
  if (tildeIndex !== -1 && tildeIndex !== 0) {
    const name = spec.slice(0, tildeIndex)
    const version = spec.slice(tildeIndex) // Include the ~ in the version
    return { name, version: version || undefined }
  }

  // Then try dependency format with = separator (e.g., package=1.0)
  const equalIndex = spec.indexOf('=')
  if (equalIndex !== -1 && equalIndex !== 0) {
    const name = spec.slice(0, equalIndex)
    const version = spec.slice(equalIndex + 1) // Don't include the = in the version
    return { name, version: version || undefined }
  }

  // No version separator found, treat as package name only
  return { name: spec }
}

/**
 * Gets package information including description and available versions
 */
export function getPackageInfo(packageName: string): {
  name: string
  domain: string
  description?: string
  latestVersion?: string
  totalVersions: number
  programs?: readonly string[]
  dependencies?: readonly string[]
  companions?: readonly string[]
} | null {
  const domain = resolvePackageName(packageName)

  // First, try to find the package by iterating through all packages and matching the domain
  for (const [_, pkg] of Object.entries(packages)) {
    if ('domain' in pkg && pkg.domain === domain) {
      const versions = 'versions' in pkg && Array.isArray(pkg.versions) ? pkg.versions : []

      return {
        name: 'name' in pkg ? (pkg.name as string) : packageName,
        domain: pkg.domain as string,
        description: 'description' in pkg ? (pkg.description as string) : undefined,
        latestVersion: versions.length > 0 ? (typeof versions[0] === 'string' ? versions[0] : String(versions[0])) : undefined,
        totalVersions: versions.length,
        programs: 'programs' in pkg ? (pkg.programs as readonly string[]) : undefined,
        dependencies: 'dependencies' in pkg ? (pkg.dependencies as readonly string[]) : undefined,
        companions: 'companions' in pkg ? (pkg.companions as readonly string[]) : undefined,
      }
    }
  }

  // Fallback to the old logic for packages that might not have explicit domains
  const domainKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase() as keyof typeof packages
  const pkg = packages[domainKey]

  if (pkg) {
    const versions = 'versions' in pkg && Array.isArray(pkg.versions) ? pkg.versions : []

    return {
      name: 'name' in pkg ? (pkg.name as string) : packageName,
      domain: 'domain' in pkg ? (pkg.domain as string) : domain,
      description: 'description' in pkg ? (pkg.description as string) : undefined,
      latestVersion: versions.length > 0 ? (typeof versions[0] === 'string' ? versions[0] : String(versions[0])) : undefined,
      totalVersions: versions.length,
      programs: 'programs' in pkg ? (pkg.programs as readonly string[]) : undefined,
      dependencies: 'dependencies' in pkg ? (pkg.dependencies as readonly string[]) : undefined,
      companions: 'companions' in pkg ? (pkg.companions as readonly string[]) : undefined,
    }
  }

  return null
}
