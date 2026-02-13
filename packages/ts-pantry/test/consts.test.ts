import { describe, expect, test } from 'bun:test'
import {
  ALL_KNOWN_PACKAGES,
  DEFAULT_CACHE_DIR,
  DEFAULT_CACHE_EXPIRATION_MINUTES,
  DEFAULT_TIMEOUT_MS,
  PACKAGE_ALIASES,
} from '../src/consts'

describe('Constants Module', () => {
  describe('PACKAGE_ALIASES', () => {
    test('should contain expected common aliases', () => {
      expect(PACKAGE_ALIASES).toBeDefined()
      expect(typeof PACKAGE_ALIASES).toBe('object')
      expect(Object.keys(PACKAGE_ALIASES).length).toBeGreaterThan(0)
    })

    test('should have correct alias mappings', () => {
      expect(PACKAGE_ALIASES.node).toBe('nodejs.org')
      expect(PACKAGE_ALIASES.python).toBe('python.org')
      expect(PACKAGE_ALIASES.go).toBe('go.dev')
      expect(PACKAGE_ALIASES.rust).toBe('rust-lang.org')
      expect(PACKAGE_ALIASES.ruby).toBe('ruby-lang.org')
      expect(PACKAGE_ALIASES.php).toBe('php.net')
      expect(PACKAGE_ALIASES.perl).toBe('perl.org')
      expect(PACKAGE_ALIASES.deno).toBe('deno.land')
      expect(PACKAGE_ALIASES.bun).toBe('bun.sh')
    })

    test('should have valid domain names as values', () => {
      Object.values(PACKAGE_ALIASES).forEach((domain) => {
        expect(typeof domain).toBe('string')
        expect(domain.length).toBeGreaterThan(0)
        expect(domain).toMatch(/^[a-z0-9.-]+$/i)
      })
    })

    test('should have valid alias names as keys', () => {
      Object.keys(PACKAGE_ALIASES).forEach((alias) => {
        expect(typeof alias).toBe('string')
        expect(alias.length).toBeGreaterThan(0)
        // Allow alphanumeric characters, dots, hyphens, and underscores for domain-like aliases
        expect(alias).toMatch(/^[\w.-]+$/)
      })
    })

    test('should not have duplicate values', () => {
      const values = Object.values(PACKAGE_ALIASES)
      // const uniqueValues = [...new Set(values)]

      // Allow some legitimate duplicates (like bun and bun.com both pointing to bun.sh)
      const allowedDuplicates = new Set(['bun.sh']) // Known legitimate duplicates
      const duplicateValues = values.filter((item, index) => values.indexOf(item) !== index)
      const unexpectedDuplicates = duplicateValues.filter(val => !allowedDuplicates.has(val))

      expect(unexpectedDuplicates.length).toBe(0)
    })

    test('should not have duplicate keys', () => {
      const keys = Object.keys(PACKAGE_ALIASES)
      const uniqueKeys = [...new Set(keys)]
      expect(keys.length).toBe(uniqueKeys.length)
    })
  })

  describe('DEFAULT_CACHE_DIR', () => {
    test('should be a valid directory path', () => {
      expect(DEFAULT_CACHE_DIR).toBeDefined()
      expect(typeof DEFAULT_CACHE_DIR).toBe('string')
      expect(DEFAULT_CACHE_DIR.length).toBeGreaterThan(0)
      expect(DEFAULT_CACHE_DIR).toBe('.cache/packages')
    })

    test('should be a relative path', () => {
      expect(DEFAULT_CACHE_DIR).not.toMatch(/^\//)
      expect(DEFAULT_CACHE_DIR).not.toMatch(/^[A-Z]:/)
    })
  })

  describe('DEFAULT_CACHE_EXPIRATION_MINUTES', () => {
    test('should be a positive number', () => {
      expect(DEFAULT_CACHE_EXPIRATION_MINUTES).toBeDefined()
      expect(typeof DEFAULT_CACHE_EXPIRATION_MINUTES).toBe('number')
      expect(DEFAULT_CACHE_EXPIRATION_MINUTES).toBeGreaterThan(0)
    })

    test('should be 24 hours (1440 minutes)', () => {
      expect(DEFAULT_CACHE_EXPIRATION_MINUTES).toBe(1440)
    })

    test('should be reasonable for caching', () => {
      // Should be at least 1 hour but not more than 7 days
      expect(DEFAULT_CACHE_EXPIRATION_MINUTES).toBeGreaterThanOrEqual(60)
      expect(DEFAULT_CACHE_EXPIRATION_MINUTES).toBeLessThanOrEqual(10080)
    })
  })

  describe('DEFAULT_TIMEOUT_MS', () => {
    test('should be a positive number', () => {
      expect(DEFAULT_TIMEOUT_MS).toBeDefined()
      expect(typeof DEFAULT_TIMEOUT_MS).toBe('number')
      expect(DEFAULT_TIMEOUT_MS).toBeGreaterThan(0)
    })

    test('should be 20 seconds (20000 ms)', () => {
      expect(DEFAULT_TIMEOUT_MS).toBe(20000)
    })

    test('should be reasonable for network operations', () => {
      // Should be at least 1 second but not more than 5 minutes
      expect(DEFAULT_TIMEOUT_MS).toBeGreaterThanOrEqual(1000)
      expect(DEFAULT_TIMEOUT_MS).toBeLessThanOrEqual(300000)
    })
  })

  describe('ALL_KNOWN_PACKAGES', () => {
    test('should be an array of package names', () => {
      expect(ALL_KNOWN_PACKAGES).toBeDefined()
      expect(Array.isArray(ALL_KNOWN_PACKAGES)).toBe(true)
      expect(ALL_KNOWN_PACKAGES.length).toBeGreaterThan(0)
    })

    test('should contain valid package domain names', () => {
      ALL_KNOWN_PACKAGES.forEach((packageName) => {
        expect(typeof packageName).toBe('string')
        expect(packageName.length).toBeGreaterThan(0)
        // Should be valid domain or domain-path format (may contain slashes for nested packages, underscores, hyphens, dots)
        expect(packageName).toMatch(/^[\w./-]+$/)
      })
    })

    test('should contain expected popular packages', () => {
      // Note: ALL_KNOWN_PACKAGES contains transformed names, not original domains
      expect(ALL_KNOWN_PACKAGES).toContain('bun.sh')
      expect(ALL_KNOWN_PACKAGES).toContain('deno.land')
      expect(ALL_KNOWN_PACKAGES).toContain('go.dev')
      expect(ALL_KNOWN_PACKAGES).toContain('php.net')
      expect(ALL_KNOWN_PACKAGES).toContain('perl.org')
      expect(ALL_KNOWN_PACKAGES).toContain('ruby-lang.org')
    })

    test('should not have duplicate entries', () => {
      const uniquePackages = [...new Set(ALL_KNOWN_PACKAGES)]
      expect(ALL_KNOWN_PACKAGES.length).toBe(uniquePackages.length)
    })

    test('should be sorted alphabetically', () => {
      const sortedPackages = [...ALL_KNOWN_PACKAGES].sort()
      expect(ALL_KNOWN_PACKAGES).toEqual(sortedPackages)
    })

    test('should contain packages from PACKAGE_ALIASES', () => {
      // Note: ALL_KNOWN_PACKAGES may not contain all alias domains since it uses transformed names
      // We'll check that at least some of the aliases are represented
      const aliasValues = Object.values(PACKAGE_ALIASES)
      const foundAliases = aliasValues.filter(domain => ALL_KNOWN_PACKAGES.includes(domain))
      expect(foundAliases.length).toBeGreaterThan(0)
    })

    test('should contain various package types', () => {
      // Programming languages
      expect(ALL_KNOWN_PACKAGES.some(pkg => ['nodejs.org', 'python.org', 'go.dev'].includes(pkg))).toBe(true)

      // Databases
      expect(ALL_KNOWN_PACKAGES.some(pkg => ['postgresql.org', 'mysql.com', 'redis.io'].includes(pkg))).toBe(true)

      // DevOps tools
      expect(ALL_KNOWN_PACKAGES.some(pkg => ['docker.com', 'kubernetes.io', 'terraform.io'].includes(pkg))).toBe(true)

      // CLI tools
      expect(ALL_KNOWN_PACKAGES.some(pkg => ['curl.se', 'git-scm.org'].includes(pkg))).toBe(true)
    })

    test('should handle nested package paths', () => {
      // In ALL_KNOWN_PACKAGES, nested paths now use slashes (from pantry)
      const nestedPackages = ALL_KNOWN_PACKAGES.filter(pkg => pkg.includes('/'))
      expect(nestedPackages.length).toBeGreaterThan(0)

      // Check some specific nested packages (with original format)
      expect(ALL_KNOWN_PACKAGES).toContain('aws.amazon.com/cli')
      expect(ALL_KNOWN_PACKAGES).toContain('agwa.name/git-crypt')
    })

    test('should have reasonable package count', () => {
      // Should have a substantial number of packages but not be unreasonably large
      expect(ALL_KNOWN_PACKAGES.length).toBeGreaterThan(100)
      expect(ALL_KNOWN_PACKAGES.length).toBeLessThan(10000)
    })
  })

  describe('Constants Integration', () => {
    test('should have consistent data between constants', () => {
      // Check that at least some aliases point to packages in ALL_KNOWN_PACKAGES
      // Note: ALL_KNOWN_PACKAGES uses transformed names, so not all will match exactly
      const aliasValues = Object.values(PACKAGE_ALIASES)
      const foundAliases = aliasValues.filter(domain => ALL_KNOWN_PACKAGES.includes(domain))
      expect(foundAliases.length).toBeGreaterThan(0)
    })

    test('should have reasonable default values for operations', () => {
      // Cache expiration should be longer than typical operation timeout
      const cacheExpirationMs = DEFAULT_CACHE_EXPIRATION_MINUTES * 60 * 1000
      expect(cacheExpirationMs).toBeGreaterThan(DEFAULT_TIMEOUT_MS * 100)
    })
  })
})
