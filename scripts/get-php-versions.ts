#!/usr/bin/env bun

/**
 * Dynamic PHP Version Generator for Launchpad
 *
 * This script fetches the latest PHP versions from the ts-pkgx registry
 * and formats them for use in GitHub workflows and documentation.
 */

// Unused interface - keeping for future use
interface _PHPVersion {
  version: string
  status: 'stable' | 'security' | 'eol'
  releaseDate?: string
}

interface ConfigDescription {
  name: string
  description: string
  useCase: string
  databaseSupport: string[]
  extensions: string[]
}

async function getPHPVersions(): Promise<string[]> {
  try {
    // Use ts-pkgx to get PHP versions
    const { execSync } = await import('node:child_process')
    const output = execSync('bunx ts-pkgx get-php-versions', { encoding: 'utf8' })

    // Parse the output - assuming it returns a JSON array or comma-separated string
    let versions: string[]
    try {
      versions = JSON.parse(output)
    }
    catch {
      // If not JSON, split by comma
      versions = output.trim().split(',').map(v => v.trim())
    }

    // Filter to only stable versions and sort by version
    const stableVersions = versions
      .filter(v => v.match(/^\d+\.\d+\.\d+$/))
      .sort((a, b) => {
        const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
        const [bMajor, bMinor, bPatch] = b.split('.').map(Number)

        if (aMajor !== bMajor)
          return bMajor - aMajor
        if (aMinor !== bMinor)
          return bMinor - aMinor
        return bPatch - aPatch
      })
      .slice(0, 4) // Keep only the 4 most recent versions

    return stableVersions
  }
  catch (error) {
    console.error('Failed to fetch PHP versions from ts-pkgx:', error)

    // Fallback to hardcoded versions
    return ['8.4.11', '8.3.24', '8.2.29', '8.1.32']
  }
}

function getConfigDescriptions(): ConfigDescription[] {
  return [
    {
      name: 'laravel-mysql',
      description: 'Laravel with MySQL/MariaDB',
      useCase: 'Laravel applications using MySQL or MariaDB',
      databaseSupport: ['MySQL', 'MariaDB'],
      extensions: ['PDO MySQL', 'MySQLi', 'GD', 'cURL', 'OpenSSL', 'ZIP', 'XML', 'Zlib'],
    },
    {
      name: 'laravel-postgres',
      description: 'Laravel with PostgreSQL',
      useCase: 'Laravel applications using PostgreSQL',
      databaseSupport: ['PostgreSQL'],
      extensions: ['PDO PostgreSQL', 'PostgreSQL', 'GD', 'cURL', 'OpenSSL', 'ZIP', 'XML', 'Zlib'],
    },
    {
      name: 'laravel-sqlite',
      description: 'Laravel with SQLite',
      useCase: 'Laravel applications using SQLite (development)',
      databaseSupport: ['SQLite'],
      extensions: ['PDO SQLite', 'SQLite3', 'GD', 'cURL', 'OpenSSL', 'ZIP', 'XML', 'Zlib'],
    },
    {
      name: 'api-only',
      description: 'API-only applications',
      useCase: 'Minimal footprint for API-only applications',
      databaseSupport: ['MySQL'],
      extensions: ['PDO MySQL', 'MySQLi', 'cURL', 'OpenSSL', 'ZIP', 'XML', 'Zlib'],
    },
    {
      name: 'enterprise',
      description: 'Enterprise applications',
      useCase: 'Full-featured configuration for enterprise applications',
      databaseSupport: ['MySQL', 'PostgreSQL', 'SQLite'],
      extensions: ['All PDO drivers', 'All database drivers', 'GD', 'SOAP', 'Sockets', 'LDAP', 'XSL', 'Sodium', 'GMP', 'Gettext'],
    },
    {
      name: 'wordpress',
      description: 'WordPress applications',
      useCase: 'WordPress optimized build',
      databaseSupport: ['MySQL'],
      extensions: ['PDO MySQL', 'MySQLi', 'GD', 'cURL', 'OpenSSL', 'ZIP', 'XML', 'Zlib'],
    },
    {
      name: 'full-stack',
      description: 'Complete PHP build',
      useCase: 'Complete PHP build with major extensions and database drivers',
      databaseSupport: ['MySQL', 'PostgreSQL', 'SQLite'],
      extensions: ['All major extensions', 'All database drivers', 'Calendar', 'FTP', 'SOAP', 'Sockets', 'LDAP', 'XSL', 'Sodium', 'GMP', 'Gettext', 'Fileinfo', 'JSON', 'PHAR', 'Filter', 'Hash', 'Session', 'Tokenizer', 'CTYPE', 'DOM', 'SimpleXML', 'XML', 'XMLReader', 'XMLWriter', 'SHMOP'],
    },
  ]
}

function generateWorkflowOutput(versions: string[], configs: ConfigDescription[]): void {
  console.log('🔍 Dynamic PHP versions:', versions.join(', '))
  console.log('')
  console.log('📋 Configuration Descriptions:')
  configs.forEach((config) => {
    console.log(`  • ${config.name}: ${config.description}`)
    console.log(`    Use case: ${config.useCase}`)
    console.log(`    Databases: ${config.databaseSupport.join(', ')}`)
    console.log('')
  })
}

function generateMarkdownTable(configs: ConfigDescription[]): string {
  let table = '| Configuration | Description | Use Case | Database Support |\n'
  table += '|---------------|-------------|----------|------------------|\n'

  configs.forEach((config) => {
    const description = config.description.replace(/\|/g, '\\|')
    const useCase = config.useCase.replace(/\|/g, '\\|')
    const databases = config.databaseSupport.join(', ').replace(/\|/g, '\\|')
    table += `| \`${config.name}\` | ${description} | ${useCase} | ${databases} |\n`
  })

  return table
}

async function main(): Promise<void> {
  const versions = await getPHPVersions()
  const configs = getConfigDescriptions()

  // Generate workflow output
  generateWorkflowOutput(versions, configs)

  // Output versions as JSON for GitHub Actions
  console.log('JSON output for GitHub Actions:')
  console.log(JSON.stringify(versions))

  // Generate markdown table
  console.log('\nMarkdown table for documentation:')
  console.log(generateMarkdownTable(configs))
}

// Run the script
if (import.meta.main) {
  main().catch(console.error)
}

export { generateMarkdownTable, getConfigDescriptions, getPHPVersions }
