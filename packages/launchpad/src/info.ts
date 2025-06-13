import { getAvailableVersions, getPackageInfo, resolvePackageName } from './install'

export interface PackageInfoDisplay {
  name: string
  domain: string
  description?: string
  latestVersion?: string
  totalVersions: number
  programs?: readonly string[]
  dependencies?: readonly string[]
  companions?: readonly string[]
  versions?: string[]
}

/**
 * Get detailed information about a package
 */
export function getDetailedPackageInfo(packageName: string, options: {
  includeVersions?: boolean
  maxVersions?: number
} = {}): PackageInfoDisplay | null {
  const { includeVersions = false, maxVersions = 10 } = options

  const info = getPackageInfo(packageName)
  if (!info) {
    return null
  }

  const result: PackageInfoDisplay = {
    name: info.name,
    domain: info.domain,
    description: info.description,
    latestVersion: info.latestVersion,
    totalVersions: info.totalVersions,
    programs: info.programs,
    dependencies: info.dependencies,
    companions: info.companions,
  }

  if (includeVersions) {
    const versions = getAvailableVersions(packageName)
    result.versions = versions.slice(0, maxVersions)
  }

  return result
}

/**
 * Format package information for CLI display
 */
export function formatPackageInfo(info: PackageInfoDisplay, options: {
  showVersions?: boolean
  showPrograms?: boolean
  showDependencies?: boolean
  showCompanions?: boolean
  compact?: boolean
} = {}): string {
  const {
    showVersions = true,
    showPrograms = true,
    showDependencies = true,
    showCompanions = true,
    compact = false,
  } = options

  const lines: string[] = []

  if (compact) {
    // Compact format
    const desc = info.description ? ` - ${info.description}` : ''
    lines.push(`📦 ${info.name} (${info.domain})${desc}`)

    if (info.latestVersion) {
      lines.push(`   Latest: ${info.latestVersion}`)
    }
  }
  else {
    // Full format
    lines.push(`📦 Package Information`)
    lines.push(`${'='.repeat(50)}`)
    lines.push('')

    lines.push(`Name: ${info.name}`)
    lines.push(`Domain: ${info.domain}`)

    if (info.description) {
      lines.push(`Description: ${info.description}`)
    }

    lines.push('')

    // Version information
    if (info.latestVersion) {
      lines.push(`Latest Version: ${info.latestVersion}`)
    }

    if (info.totalVersions > 0) {
      lines.push(`Total Versions: ${info.totalVersions}`)
    }

    if (showVersions && info.versions && info.versions.length > 0) {
      lines.push('')
      lines.push(`Available Versions:`)
      const displayVersions = info.versions.slice(0, 10)
      displayVersions.forEach((version, index) => {
        const isLatest = index === 0 ? ' (latest)' : ''
        lines.push(`  • ${version}${isLatest}`)
      })

      if (info.versions.length > 10) {
        lines.push(`  ... and ${info.versions.length - 10} more`)
      }
    }

    // Programs
    if (showPrograms && info.programs && info.programs.length > 0) {
      lines.push('')
      lines.push(`Programs:`)
      info.programs.forEach((program) => {
        lines.push(`  • ${program}`)
      })
    }

    // Dependencies
    if (showDependencies && info.dependencies && info.dependencies.length > 0) {
      lines.push('')
      lines.push(`Dependencies:`)
      info.dependencies.forEach((dep) => {
        lines.push(`  • ${dep}`)
      })
    }

    // Companions
    if (showCompanions && info.companions && info.companions.length > 0) {
      lines.push('')
      lines.push(`Companion Packages:`)
      info.companions.forEach((companion) => {
        lines.push(`  • ${companion}`)
      })
    }

    lines.push('')
    lines.push(`Installation:`)
    lines.push(`  launchpad install ${info.name}`)

    if (info.latestVersion) {
      lines.push(`  launchpad install ${info.name}@${info.latestVersion}`)
    }
  }

  return lines.join('\n')
}

/**
 * Check if a package exists
 */
export function packageExists(packageName: string): boolean {
  return getPackageInfo(packageName) !== null
}

/**
 * Get package suggestions for typos or similar names
 */
export async function getPackageSuggestions(packageName: string, limit = 5): Promise<string[]> {
  // Import dynamically to avoid circular dependency
  try {
    const { searchPackages } = await import('./search')

    // Try fuzzy search with the package name
    const results = searchPackages(packageName, { limit })

    return results.map(result => result.name)
  }
  catch {
    return []
  }
}

/**
 * Format package not found error with suggestions
 */
export async function formatPackageNotFound(packageName: string): Promise<string> {
  const suggestions = await getPackageSuggestions(packageName)

  const lines = [
    `❌ Package '${packageName}' not found.`,
    '',
  ]

  if (suggestions.length > 0) {
    lines.push('Did you mean one of these?')
    suggestions.forEach((suggestion: string) => {
      lines.push(`  • ${suggestion}`)
    })
    lines.push('')
    lines.push('Use "launchpad search <term>" to find packages.')
  }
  else {
    lines.push('Use "launchpad search <term>" to find available packages.')
  }

  return lines.join('\n')
}
