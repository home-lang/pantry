import { getPackageInfo } from './install'

export interface CategoryInfo {
  name: string
  description: string
  packageCount: number
  packages: string[]
}

export interface TaggedPackage {
  name: string
  domain: string
  description?: string
  category: string
  programs?: readonly string[]
  latestVersion?: string
}

/**
 * Predefined package categories based on ts-pkgx categorization
 */
export const PACKAGE_CATEGORIES = {
  'Programming Languages': {
    description: 'Popular programming languages and their runtimes',
    domains: [
      'nodejs.org',
      'python.org',
      'rust-lang.org',
      'ruby-lang.org',
      'go.dev',
      'scala-lang.org',
      'julia-lang.org',
      'kotlin-lang.org',
      'perl.org',
      'php.net',
      'swift.org',
      'typescript-lang.org',
      'crystal-lang.org',
      'elixir-lang.org',
      'haskell.org',
      'gleam.run',
      'deno.land',
      'vlang.io',
      'zig-lang.org',
      'nim-lang.org',
      'ocaml.org',
      'dart.dev',
      'erlang.org',
    ],
  },
  'JavaScript & Node.js': {
    description: 'JavaScript runtimes, frameworks, and tools',
    domains: [
      'nodejs.org',
      'bun.sh',
      'deno.land',
      'npmjs.com',
      'pnpm.io',
      'yarnpkg.com',
      'classic.yarnpkg.com',
      'vitejs.dev',
      'angular.dev',
      'expo.dev',
      'flutter.dev',
    ],
  },
  'Package Managers': {
    description: 'Package managers and build systems',
    domains: [
      'npmjs.com',
      'pnpm.io',
      'yarnpkg.com',
      'python-poetry.org',
      'pipenv.pypa.io',
      'pip.pypa.io',
      'rubygems.org',
      'crates.io',
      'maven.apache.org',
      'gradle.org',
      'cmake.org',
      'ninja-build.org',
      'meson-build.com',
    ],
  },
  'Databases': {
    description: 'Database systems and data storage solutions',
    domains: [
      'postgresql.org',
      'mysql.com',
      'redis.io',
      'mongodb.com',
      'sqlite.org',
      'cassandra.apache.org',
      'influxdata.com',
      'couchdb.apache.org',
      'neo4j.com',
      'clickhouse.com',
      'surrealdb.com',
      'duckdb.org',
      'valkey.io',
    ],
  },
  'DevOps & Infrastructure': {
    description: 'Container orchestration, infrastructure as code, and deployment tools',
    domains: [
      'docker.com',
      'kubernetes.io',
      'terraform.io',
      'helm.sh',
      'consul.io',
      'vault.hashicorp.io',
      'nomad-project.io',
      'ansible.com',
      'podman.io',
      'traefik.io',
      'envoyproxy.io',
      'istio.io',
      'cilium.io',
      'fluxcd.io',
      'argoproj.github.io',
    ],
  },
  'Cloud Platforms': {
    description: 'Cloud platform CLIs and deployment services',
    domains: [
      'cli.github.com',
      'aws.amazon.com',
      'cloud.google.com',
      'azure.microsoft.com',
      'heroku.com',
      'fly.io',
      'railway.app',
      'vercel.com',
      'netlify.com',
    ],
  },
  'Development Tools': {
    description: 'Essential development utilities and editors',
    domains: [
      'git-scm.com',
      'neovim.io',
      'vim.org',
      'code.visualstudio.com',
      'prettier.io',
      'eslint.org',
      'jq.dev',
      'yq.dev',
    ],
  },
  'Web Servers': {
    description: 'Web servers, reverse proxies, and load balancers',
    domains: [
      'nginx.org',
      'apache.org',
      'traefik.io',
      'caddy.dev',
      'haproxy.org',
    ],
  },
  'CLI Tools': {
    description: 'Command-line utilities and system tools',
    domains: [
      'curl.se',
      'wget.gnu.org',
      'htop.dev',
      'tree.dev',
      'ripgrep.dev',
      'fd.dev',
      'bat.dev',
      'exa.dev',
      'fzf.dev',
    ],
  },
  'Security': {
    description: 'Security tools and authentication services',
    domains: [
      'bitwarden.com',
      '1password.com',
      'hashicorp.com',
      'vault.hashicorp.io',
      'age.dev',
      'gnupg.org',
    ],
  },
  'Testing': {
    description: 'Testing frameworks and quality assurance tools',
    domains: [
      'pytest.org',
      'jest.dev',
      'mocha.dev',
      'cypress.io',
      'playwright.dev',
    ],
  },
  'Monitoring': {
    description: 'Application monitoring and observability tools',
    domains: [
      'grafana.com',
      'sentry.io',
      'prometheus.io',
      'jaeger.dev',
    ],
  },
} as const

/**
 * Get all available categories
 */
export function getAvailableCategories(): CategoryInfo[] {
  const categories: CategoryInfo[] = []

  for (const [name, info] of Object.entries(PACKAGE_CATEGORIES)) {
    // Count packages that actually exist
    const existingPackages = info.domains.filter((domain) => {
      try {
        return getPackageInfo(domain) !== null
      }
      catch {
        return false
      }
    })

    if (existingPackages.length > 0) {
      categories.push({
        name,
        description: info.description,
        packageCount: existingPackages.length,
        packages: existingPackages,
      })
    }
  }

  return categories.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get packages by category
 */
export function getPackagesByCategory(categoryName: string): TaggedPackage[] {
  const category = PACKAGE_CATEGORIES[categoryName as keyof typeof PACKAGE_CATEGORIES]
  if (!category) {
    return []
  }

  const taggedPackages: TaggedPackage[] = []

  for (const domain of category.domains) {
    const info = getPackageInfo(domain)
    if (info) {
      taggedPackages.push({
        name: info.name,
        domain: info.domain,
        description: info.description,
        category: categoryName,
        programs: info.programs,
        latestVersion: info.latestVersion,
      })
    }
  }

  return taggedPackages.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Search packages by tag/category
 */
export function searchPackagesByTag(searchTerm: string): TaggedPackage[] {
  const normalizedSearch = searchTerm.toLowerCase()
  const results: TaggedPackage[] = []

  // Search in category names and descriptions
  for (const [categoryName, categoryInfo] of Object.entries(PACKAGE_CATEGORIES)) {
    const categoryMatches
      = categoryName.toLowerCase().includes(normalizedSearch)
        || categoryInfo.description.toLowerCase().includes(normalizedSearch)

    if (categoryMatches) {
      const categoryPackages = getPackagesByCategory(categoryName)
      results.push(...categoryPackages)
    }
  }

  // Remove duplicates
  const seen = new Set<string>()
  return results.filter((pkg) => {
    if (seen.has(pkg.domain)) {
      return false
    }
    seen.add(pkg.domain)
    return true
  })
}

/**
 * Get category for a specific package
 */
export function getPackageCategory(packageName: string): string | null {
  for (const [categoryName, categoryInfo] of Object.entries(PACKAGE_CATEGORIES)) {
    if (categoryInfo.domains.includes(packageName)) {
      return categoryName
    }
  }
  return null
}

/**
 * Format categories list for CLI display
 */
export function formatCategoriesList(categories: CategoryInfo[]): string {
  const lines: string[] = []

  lines.push('🏷️  Available Package Categories')
  lines.push('='.repeat(50))
  lines.push('')

  for (const category of categories) {
    lines.push(`📂 ${category.name} (${category.packageCount} packages)`)
    lines.push(`   ${category.description}`)
    lines.push('')
  }

  lines.push('Usage:')
  lines.push('  launchpad packages --category "Programming Languages"')
  lines.push('  launchpad tags search web')
  lines.push('  launchpad packages --tag databases')

  return lines.join('\n')
}

/**
 * Format packages by category for CLI display
 */
export function formatPackagesByCategory(
  categoryName: string,
  packages: TaggedPackage[],
  options: {
    compact?: boolean
    showPrograms?: boolean
    showVersions?: boolean
  } = {},
): string {
  const { compact = false, showPrograms = true, showVersions = true } = options
  const lines: string[] = []

  if (packages.length === 0) {
    return `No packages found in category "${categoryName}".`
  }

  lines.push(`📂 ${categoryName} (${packages.length} packages)`)
  lines.push('='.repeat(50))
  lines.push('')

  if (compact) {
    // Compact format - one line per package
    for (const pkg of packages) {
      const version = showVersions && pkg.latestVersion ? ` v${pkg.latestVersion}` : ''
      const programs = showPrograms && pkg.programs && pkg.programs.length > 0
        ? ` (${pkg.programs.slice(0, 3).join(', ')}${pkg.programs.length > 3 ? '...' : ''})`
        : ''

      lines.push(`📦 ${pkg.name}${version}${programs}`)
      if (pkg.description) {
        lines.push(`   ${pkg.description}`)
      }
      lines.push('')
    }
  }
  else {
    // Full format
    for (const pkg of packages) {
      lines.push(`📦 ${pkg.name}`)
      lines.push(`   Domain: ${pkg.domain}`)

      if (pkg.description) {
        lines.push(`   Description: ${pkg.description}`)
      }

      if (showVersions && pkg.latestVersion) {
        lines.push(`   Latest Version: ${pkg.latestVersion}`)
      }

      if (showPrograms && pkg.programs && pkg.programs.length > 0) {
        lines.push(`   Programs: ${pkg.programs.join(', ')}`)
      }

      lines.push(`   Install: launchpad install ${pkg.name}`)
      lines.push('')
    }
  }

  lines.push(`Total: ${packages.length} packages`)
  lines.push('')
  lines.push('Install multiple packages:')
  lines.push(`  launchpad install ${packages.slice(0, 3).map(p => p.name).join(' ')}`)

  return lines.join('\n')
}

/**
 * Format tag search results for CLI display
 */
export function formatTagSearchResults(
  searchTerm: string,
  packages: TaggedPackage[],
  options: {
    compact?: boolean
    groupByCategory?: boolean
  } = {},
): string {
  const { compact = false, groupByCategory = true } = options
  const lines: string[] = []

  if (packages.length === 0) {
    lines.push(`No packages found matching tag "${searchTerm}".`)
    lines.push('')
    lines.push('Available categories:')
    const categories = getAvailableCategories()
    categories.slice(0, 5).forEach((cat) => {
      lines.push(`  • ${cat.name}`)
    })
    return lines.join('\n')
  }

  lines.push(`🔍 Packages matching "${searchTerm}" (${packages.length} found)`)
  lines.push('='.repeat(50))
  lines.push('')

  if (groupByCategory) {
    // Group by category
    const grouped = new Map<string, TaggedPackage[]>()

    for (const pkg of packages) {
      if (!grouped.has(pkg.category)) {
        grouped.set(pkg.category, [])
      }
      grouped.get(pkg.category)!.push(pkg)
    }

    for (const [category, categoryPackages] of grouped) {
      lines.push(`📂 ${category} (${categoryPackages.length} packages)`)
      lines.push('-'.repeat(30))

      for (const pkg of categoryPackages) {
        if (compact) {
          lines.push(`  📦 ${pkg.name} - ${pkg.description || 'No description'}`)
        }
        else {
          lines.push(`  📦 ${pkg.name}`)
          if (pkg.description) {
            lines.push(`     ${pkg.description}`)
          }
          lines.push(`     Install: launchpad install ${pkg.name}`)
        }
      }
      lines.push('')
    }
  }
  else {
    // Simple list
    for (const pkg of packages) {
      if (compact) {
        lines.push(`📦 ${pkg.name} (${pkg.category}) - ${pkg.description || 'No description'}`)
      }
      else {
        lines.push(`📦 ${pkg.name}`)
        lines.push(`   Category: ${pkg.category}`)
        if (pkg.description) {
          lines.push(`   Description: ${pkg.description}`)
        }
        lines.push(`   Install: launchpad install ${pkg.name}`)
        lines.push('')
      }
    }
  }

  return lines.join('\n')
}
