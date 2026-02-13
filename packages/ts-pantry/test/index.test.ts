import type { Packages } from '../src/index'
import { describe, expect, test } from 'bun:test'
import { aliases } from '../src/packages/aliases'
import { packages } from '../src/packages/index'

describe('Index Module', () => {
  describe('Main Exports', () => {
    test('should export packages object', () => {
      expect(packages).toBeDefined()
      expect(typeof packages).toBe('object')
    })

    test('should export packages object', () => {
      expect(packages).toBeDefined()
      expect(typeof packages).toBe('object')
    })

    test('should export aliases object', () => {
      expect(aliases).toBeDefined()
      expect(typeof aliases).toBe('object')
      expect(Object.keys(aliases).length).toBeGreaterThan(0)
    })
  })

  describe('Type Exports', () => {
    test('should export Packages type', () => {
      // Test that the type exists by creating a variable of that type
      const testPackages: Packages = packages
      expect(testPackages).toBeDefined()
    })

    test('should export Packages type', () => {
      // Test that the type exists by creating a variable of that type
      const testPackages: Packages = packages
      expect(testPackages).toBeDefined()
    })
  })

  describe('Packages Object Structure', () => {
    test('should have package properties', () => {
      const packagesKeys = Object.keys(packages)
      expect(packagesKeys.length).toBeGreaterThan(0)

      // Check that at least some common packages exist
      const hasNodejs = packagesKeys.some(key => key.includes('nodejs') || key.includes('node'))
      const hasPython = packagesKeys.some(key => key.includes('python'))

      expect(hasNodejs || hasPython).toBe(true)
    })

    test('should have consistent package structure', () => {
      const packagesKeys = Object.keys(packages)

      if (packagesKeys.length > 0) {
        const firstPackage = packages[packagesKeys[0] as keyof typeof packages]

        // Check that package has expected properties
        expect(firstPackage).toHaveProperty('name')
        expect(firstPackage).toHaveProperty('domain')
        expect(firstPackage).toHaveProperty('description')
        expect(firstPackage).toHaveProperty('installCommand')
        expect(firstPackage).toHaveProperty('programs')
        expect(firstPackage).toHaveProperty('versions')

        // Check property types
        expect(typeof firstPackage.name).toBe('string')
        expect(typeof firstPackage.domain).toBe('string')
        expect(typeof firstPackage.description).toBe('string')
        expect(typeof firstPackage.installCommand).toBe('string')
        expect(Array.isArray(firstPackage.programs)).toBe(true)
        expect(Array.isArray(firstPackage.versions)).toBe(true)
      }
    })
  })

  describe('Packages Object Structure', () => {
    test('should have package entries', () => {
      const packageKeys = Object.keys(packages)
      expect(packageKeys.length).toBeGreaterThan(0)
    })

    test('should have consistent package structure', () => {
      const packageKeys = Object.keys(packages)

      if (packageKeys.length > 0) {
        const firstPackage = packages[packageKeys[0] as keyof typeof packages]

        // Check that package has expected properties
        expect(firstPackage).toHaveProperty('name')
        expect(firstPackage).toHaveProperty('domain')
        expect(firstPackage).toHaveProperty('description')
        expect(firstPackage).toHaveProperty('installCommand')
        expect(firstPackage).toHaveProperty('programs')
        expect(firstPackage).toHaveProperty('versions')
      }
    })

    test('should match packages structure', () => {
      const packagesKeys = Object.keys(packages)
      const packageKeys = Object.keys(packages)

      // Both should have the same number of entries
      expect(packagesKeys.length).toBe(packageKeys.length)

      // Both should reference the same packages
      if (packagesKeys.length > 0 && packageKeys.length > 0) {
        const firstPackagesPackage = packages[packagesKeys[0] as keyof typeof packages]
        const firstPackagePackage = packages[packageKeys[0] as keyof typeof packages]

        expect(firstPackagesPackage.domain).toBe(firstPackagePackage.domain)
      }
    })
  })

  describe('Aliases Object Structure', () => {
    test('should have string key-value pairs', () => {
      const aliasEntries = Object.entries(aliases)

      expect(aliasEntries.length).toBeGreaterThan(0)

      for (const [alias, domain] of aliasEntries) {
        expect(typeof alias).toBe('string')
        expect(typeof domain).toBe('string')
        expect(alias.length).toBeGreaterThan(0)
        expect(domain.length).toBeGreaterThan(0)
      }
    })

    test('should contain common aliases', () => {
      // Check for some expected aliases
      const aliasKeys = Object.keys(aliases)

      // Should have at least some common aliases (actual aliases, not self-referential ones)
      const hasPhpAlias = aliasKeys.includes('php')
      const hasRubyAlias = aliasKeys.includes('ruby')
      const hasGoAlias = aliasKeys.includes('go')

      expect(hasPhpAlias || hasRubyAlias || hasGoAlias).toBe(true)
    })

    test('should map aliases to valid domains', () => {
      const aliasEntries = Object.entries(aliases)

      for (const [alias, domain] of aliasEntries) {
        // Domain should look like a valid domain
        expect(domain).toMatch(/^[a-z0-9.-]+/i)

        // Alias should be a reasonable identifier (allow slashes and spaces for nested packages and multi-word aliases)
        expect(alias).toMatch(/^[\w./\-\s]+$/)
      }
    })
  })

  describe('Integration Tests', () => {
    test('should have consistent data across exports', () => {
      const packagesKeys = Object.keys(packages)
      const packageKeys = Object.keys(packages)
      const aliasValues = Object.values(aliases)

      // All exports should be non-empty
      expect(packagesKeys.length).toBeGreaterThan(0)
      expect(packageKeys.length).toBeGreaterThan(0)
      expect(aliasValues.length).toBeGreaterThan(0)

      // Aliases should point to domains that exist in packages/packages
      if (packagesKeys.length > 0) {
        const packagesDomains = packagesKeys.map((key) => {
          const pkg = packages[key as keyof typeof packages]
          return pkg.domain
        })

        // At least some aliases should point to existing domains
        const validAliases = aliasValues.filter(domain => packagesDomains.includes(domain as any))
        expect(validAliases.length).toBeGreaterThan(0)
      }
    })

    test('should provide access to package data via aliases', () => {
      const aliasEntries = Object.entries(aliases)

      if (aliasEntries.length > 0) {
        const [_alias, domain] = aliasEntries[0]

        // Find the package with this domain
        const packagesKeys = Object.keys(packages)
        const matchingPackage = packagesKeys.find((key) => {
          const pkg = packages[key as keyof typeof packages]
          return pkg.domain === domain
        })

        if (matchingPackage) {
          const pkg = packages[matchingPackage as keyof typeof packages]
          expect(pkg.domain).toBe(domain as any)
          expect(pkg.name).toBeDefined()
          expect(pkg.description).toBeDefined()
        }
      }
    })

    test('should have proper TypeScript types', () => {
      // Test that TypeScript types are working correctly
      const packagesKeys = Object.keys(packages)

      if (packagesKeys.length > 0) {
        const firstKey = packagesKeys[0] as keyof typeof packages
        const firstPackage = packages[firstKey]

        // These should all be properly typed
        expect(typeof firstPackage.name).toBe('string')
        expect(typeof firstPackage.domain).toBe('string')
        expect(typeof firstPackage.description).toBe('string')
        expect(typeof firstPackage.installCommand).toBe('string')
        expect(Array.isArray(firstPackage.programs)).toBe(true)
        expect(Array.isArray(firstPackage.versions)).toBe(true)

        // Optional properties should be undefined or the correct type
        if (firstPackage.aliases) {
          expect(Array.isArray(firstPackage.aliases)).toBe(true)
        }

        if (firstPackage.companions) {
          expect(Array.isArray(firstPackage.companions)).toBe(true)
        }

        if (firstPackage.dependencies) {
          expect(Array.isArray(firstPackage.dependencies)).toBe(true)
        }
      }
    })
  })

  describe('Package Data Validation', () => {
    test('should have valid install commands', () => {
      const packagesKeys = Object.keys(packages)

      for (const key of packagesKeys.slice(0, 5)) { // Test first 5 packages
        const pkg = packages[key as keyof typeof packages]

        // Install command should start with 'launchpad install' (new format)
        expect(pkg.installCommand).toMatch(/^launchpad install/)

        // Should contain some reference to the package (domain, alias, or name)
        const containsDomain = pkg.installCommand.includes(pkg.domain)
        const containsAlias = pkg.aliases && pkg.aliases.some(alias => pkg.installCommand.includes(alias))
        const containsName = pkg.name && pkg.installCommand.includes(pkg.name)
        expect(containsDomain || containsAlias || containsName).toBe(true)
      }
    })

    test('should have non-empty required fields', () => {
      const packagesKeys = Object.keys(packages)

      for (const key of packagesKeys.slice(0, 5)) { // Test first 5 packages
        const pkg = packages[key as keyof typeof packages]

        // Name should exist (can be empty for some packages)
        expect(pkg.name).toBeDefined()
        expect(pkg.domain.length).toBeGreaterThan(0)
        expect(pkg.description.length).toBeGreaterThan(0)
        expect(pkg.installCommand.length).toBeGreaterThan(0)

        // Programs array should exist (can be empty)
        expect(Array.isArray(pkg.programs)).toBe(true)

        // Versions array should exist (can be empty)
        expect(Array.isArray(pkg.versions)).toBe(true)
      }
    })

    test('should have valid domain formats', () => {
      const packagesKeys = Object.keys(packages)

      for (const key of packagesKeys.slice(0, 5)) { // Test first 5 packages
        const pkg = packages[key as keyof typeof packages]

        // Domain should be a valid format
        expect(pkg.domain).toMatch(/^[a-z0-9.-]+/i)

        // Should not have spaces
        expect(pkg.domain).not.toContain(' ')
      }
    })

    test('should have reasonable version formats', () => {
      const packagesKeys = Object.keys(packages)

      for (const key of packagesKeys.slice(0, 5)) { // Test first 5 packages
        const pkg = packages[key as keyof typeof packages]

        if (pkg.versions.length > 0) {
          // Test first 3 versions by accessing them directly to avoid complex union types
          const maxVersionsToTest = Math.min(3, pkg.versions.length)
          for (let i = 0; i < maxVersionsToTest; i++) {
            const version = pkg.versions[i]
            // Version should be a string
            expect(typeof version).toBe('string')
            expect(version.length).toBeGreaterThan(0)

            // Should not have spaces
            expect(version).not.toContain(' ')
          }
        }
      }
    })
  })

  describe('Error Handling', () => {
    test('should handle missing packages gracefully', () => {
      // Try to access a non-existent package
      const nonExistentKey = 'this-package-does-not-exist-12345'

      // Should not throw when accessing non-existent property
      expect(() => {
        const pkg = packages[nonExistentKey as keyof typeof packages]
        return pkg
      }).not.toThrow()
    })

    test('should handle empty objects gracefully', () => {
      // Even if objects are empty, they should still be objects
      expect(typeof packages).toBe('object')
      expect(typeof packages).toBe('object')
      expect(typeof aliases).toBe('object')

      // Should not throw when getting keys
      expect(() => Object.keys(packages)).not.toThrow()
      expect(() => Object.keys(packages)).not.toThrow()
      expect(() => Object.keys(aliases)).not.toThrow()
    })
  })
})
