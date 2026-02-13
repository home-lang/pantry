/**
 * External alias overrides and additions
 *
 * This file allows you to define additional aliases or override aliases
 * for packages without modifying the generated package files.
 * These aliases will persist through package regeneration.
 */

export interface AliasOverride {
  /** The domain of the package to add aliases for */
  domain: string
  /** Additional aliases to add for this package */
  aliases: string[]
  /** Whether to replace existing aliases (true) or add to them (false, default) */
  replace?: boolean
}

/**
 * External alias overrides
 * Add entries here to define aliases that should persist through regeneration
 */
export const ALIAS_OVERRIDES: AliasOverride[] = [
  // Common programming languages
  {
    domain: 'php.net',
    aliases: ['php'],
  },
  {
    domain: 'ruby-lang.org',
    aliases: ['ruby'],
  },
  {
    domain: 'go.dev',
    aliases: ['go'],
  },
  {
    domain: 'nodejs.org',
    aliases: ['node'],
  },
  {
    domain: 'python.org',
    aliases: ['python', 'py'],
  },

  // Common tools with short names
  {
    domain: 'curl.se',
    aliases: ['curl'],
  },
  {
    domain: 'git-scm.com',
    aliases: ['git'],
  },
  {
    domain: 'vim.org',
    aliases: ['vim', 'vi'],
  },

  // Package managers
  {
    domain: 'npmjs.com',
    aliases: ['npm'],
  },
  {
    domain: 'classic.yarnpkg.com',
    aliases: ['yarn'],
  },
  {
    domain: 'bun.sh',
    aliases: ['bun', 'bun.com'],
  },

  // S3 tools
  {
    domain: 's3tools.org',
    aliases: ['s3cmd'],
  },

  // AWS Tools
  {
    domain: 'aws.amazon.com/cdk',
    aliases: ['cdk', 'aws/cdk'],
  },

  // Compression/Archive tools
  {
    domain: 'info-zip.org/zip',
    aliases: ['zip'],
  },
  {
    domain: 'info-zip.org/unzip',
    aliases: ['unzip'],
  },
]

/**
 * Get alias overrides for a specific domain
 */
export function getAliasOverrides(domain: string): string[] {
  const override = ALIAS_OVERRIDES.find(o => o.domain === domain)
  return override ? override.aliases : []
}

/**
 * Check if a domain should replace existing aliases
 */
export function shouldReplaceAliases(domain: string): boolean {
  const override = ALIAS_OVERRIDES.find(o => o.domain === domain)
  return override?.replace === true
}

/**
 * Get all alias mappings from overrides
 */
export function getAllAliasOverrides(): Record<string, string> {
  const aliases: Record<string, string> = {}

  for (const override of ALIAS_OVERRIDES) {
    for (const alias of override.aliases) {
      aliases[alias] = override.domain
    }
  }

  return aliases
}
