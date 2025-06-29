import { aliases, packages } from 'ts-pkgx'
import { getPackageInfo } from './install'

export interface SearchResult {
  name: string
  domain: string
  description?: string
  latestVersion?: string
  totalVersions: number
  programs?: readonly string[]
  matchType: 'exact' | 'alias' | 'domain' | 'description' | 'program'
  relevanceScore: number
}

/**
 * Search for packages by name, description, or programs
 */
export function searchPackages(searchTerm: string, options: {
  limit?: number
  includePrograms?: boolean
  caseSensitive?: boolean
} = {}): SearchResult[] {
  const {
    limit = 50,
    includePrograms = true,
    caseSensitive = false,
  } = options

  if (!searchTerm || searchTerm.trim().length === 0) {
    return []
  }

  const normalizedSearch = caseSensitive ? searchTerm.trim() : searchTerm.trim().toLowerCase()
  const results: SearchResult[] = []
  const seen = new Set<string>()

  // Helper function to calculate relevance score
  const calculateScore = (text: string, matchType: SearchResult['matchType']): number => {
    const normalizedText = caseSensitive ? text : text.toLowerCase()

    // Exact match gets highest score
    if (normalizedText === normalizedSearch)
      return 100

    // Starts with search term gets high score
    if (normalizedText.startsWith(normalizedSearch))
      return 80

    // Contains search term gets medium score
    if (normalizedText.includes(normalizedSearch))
      return 60

    // Match type bonuses
    const typeBonus = {
      exact: 50,
      alias: 40,
      domain: 30,
      program: 20,
      description: 10,
    }[matchType]

    return Math.max(10, typeBonus)
  }

  // Search through aliases first (highest priority)
  for (const [alias, _domain] of Object.entries(aliases)) {
    const normalizedAlias = caseSensitive ? alias : alias.toLowerCase()

    if (normalizedAlias.includes(normalizedSearch)) {
      const info = getPackageInfo(alias)
      if (info && !seen.has(info.domain)) {
        seen.add(info.domain)

        const matchType: SearchResult['matchType'] = normalizedAlias === normalizedSearch ? 'exact' : 'alias'
        const relevanceScore = calculateScore(alias, matchType)

        results.push({
          name: alias,
          domain: info.domain,
          description: info.description,
          latestVersion: info.latestVersion,
          totalVersions: info.totalVersions,
          programs: info.programs,
          matchType,
          relevanceScore,
        })
      }
    }
  }

  // Search through package domains
  for (const [domainKey, pkg] of Object.entries(packages)) {
    const domain = domainKey.replace(/_/g, '.')
    const normalizedDomain = caseSensitive ? domain : domain.toLowerCase()

    if (normalizedDomain.includes(normalizedSearch)) {
      const info = getPackageInfo(domain)
      if (info && !seen.has(info.domain)) {
        seen.add(info.domain)

        const matchType: SearchResult['matchType'] = normalizedDomain === normalizedSearch ? 'exact' : 'domain'
        const relevanceScore = calculateScore(domain, matchType)

        results.push({
          name: 'name' in pkg ? (pkg.name as string) : domain,
          domain: info.domain,
          description: info.description,
          latestVersion: info.latestVersion,
          totalVersions: info.totalVersions,
          programs: info.programs,
          matchType,
          relevanceScore,
        })
      }
    }
  }

  // Search through descriptions
  for (const [domainKey, pkg] of Object.entries(packages)) {
    const domain = domainKey.replace(/_/g, '.')

    if ('description' in pkg && pkg.description) {
      const normalizedDesc = caseSensitive ? pkg.description as string : (pkg.description as string).toLowerCase()

      if (normalizedDesc.includes(normalizedSearch)) {
        const info = getPackageInfo(domain)
        if (info && !seen.has(info.domain)) {
          seen.add(info.domain)

          const relevanceScore = calculateScore(pkg.description as string, 'description')

          results.push({
            name: 'name' in pkg ? (pkg.name as string) : domain,
            domain: info.domain,
            description: info.description,
            latestVersion: info.latestVersion,
            totalVersions: info.totalVersions,
            programs: info.programs,
            matchType: 'description',
            relevanceScore,
          })
        }
      }
    }
  }

  // Search through programs if enabled
  if (includePrograms) {
    for (const [domainKey, pkg] of Object.entries(packages)) {
      const domain = domainKey.replace(/_/g, '.')

      if ('programs' in pkg && Array.isArray(pkg.programs)) {
        const programs = pkg.programs as string[]
        const matchingProgram = programs.find((program) => {
          const normalizedProgram = caseSensitive ? program : program.toLowerCase()
          return normalizedProgram.includes(normalizedSearch)
        })

        if (matchingProgram) {
          const info = getPackageInfo(domain)
          if (info && !seen.has(info.domain)) {
            seen.add(info.domain)

            const relevanceScore = calculateScore(matchingProgram, 'program')

            results.push({
              name: 'name' in pkg ? (pkg.name as string) : domain,
              domain: info.domain,
              description: info.description,
              latestVersion: info.latestVersion,
              totalVersions: info.totalVersions,
              programs: info.programs,
              matchType: 'program',
              relevanceScore,
            })
          }
        }
      }
    }
  }

  // Sort by relevance score (highest first), then by name
  results.sort((a, b) => {
    if (a.relevanceScore !== b.relevanceScore) {
      return b.relevanceScore - a.relevanceScore
    }
    return a.name.localeCompare(b.name)
  })

  return results.slice(0, limit)
}

/**
 * Get popular/featured packages
 */
export function getPopularPackages(limit = 20): SearchResult[] {
  const popularAliases = [
    'go',
    'perl',
    'php',
    'aws',
    'aws/cdk',
    'aws/cli',
    'cdk',
    'protoc',
    'xray',
    'weed',
  ]

  const results: SearchResult[] = []

  for (const alias of popularAliases) {
    const info = getPackageInfo(alias)
    if (info) {
      results.push({
        name: alias,
        domain: info.domain,
        description: info.description,
        latestVersion: info.latestVersion,
        totalVersions: info.totalVersions,
        programs: info.programs,
        matchType: 'exact',
        relevanceScore: 100,
      })
    }

    if (results.length >= limit)
      break
  }

  return results
}

/**
 * Highlight search term in text
 */
function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return text
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '\x1B[43m\x1B[30m$1\x1B[0m')
}

/**
 * Format search results for CLI display
 */
export function formatSearchResults(results: SearchResult[], options: {
  showPrograms?: boolean
  showVersions?: boolean
  compact?: boolean
  searchTerm?: string
} = {}): string {
  const { showPrograms = true, showVersions = true, compact = false, searchTerm = '' } = options

  if (results.length === 0) {
    return 'No packages found matching your search.'
  }

  const lines: string[] = []

  if (!compact) {
    const packageWord = results.length === 1 ? 'package' : 'packages'
    lines.push(`Found ${results.length} ${packageWord}:\n`)
  }

  for (const result of results) {
    if (compact) {
      // Compact format: name (domain) - description
      const desc = result.description ? ` - ${highlightSearchTerm(result.description, searchTerm)}` : ''
      lines.push(`${highlightSearchTerm(result.name, searchTerm)} (${highlightSearchTerm(result.domain, searchTerm)})${desc}`)
    }
    else {
      // Full format with details
      lines.push(`📦 \x1B[1m${highlightSearchTerm(result.name, searchTerm)}\x1B[0m (\x1B[3m${highlightSearchTerm(result.domain, searchTerm)}\x1B[0m)`)

      if (result.description) {
        lines.push(`   ${highlightSearchTerm(result.description, searchTerm)}`)
      }

      const details: string[] = []

      if (showVersions && result.latestVersion) {
        details.push(`\x1B[2mLatest:\x1B[0m ${result.latestVersion}`)
      }

      if (showVersions && result.totalVersions > 0) {
        details.push(`${result.totalVersions} versions available`)
      }

      if (details.length > 0) {
        lines.push(`   ${details.join(' • ')}`)
      }

      if (showPrograms && result.programs && result.programs.length > 0) {
        const highlightedPrograms = result.programs.map(prog => highlightSearchTerm(prog, searchTerm)).join(', ')
        lines.push(`   \x1B[2mPrograms:\x1B[0m ${highlightedPrograms}`)
      }

      lines.push('')
    }
  }

  return lines.join('\n')
}
