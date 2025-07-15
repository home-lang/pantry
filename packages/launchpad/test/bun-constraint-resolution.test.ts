import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Test the constraint resolution logic that we implemented
async function resolveBunVersionConstraint(versionSpec: string, availableVersions: string[] = ['1.2.19', '1.2.18', '1.2.17']): Promise<string> {
  // For exact versions, return as-is
  if (/^\d+\.\d+\.\d+$/.test(versionSpec)) {
    return versionSpec
  }

  // For latest or *, get the latest version
  if (versionSpec === 'latest' || versionSpec === '*') {
    return availableVersions[0] // Assume sorted descending
  }

  // Use Bun's built-in semver if available
  if (typeof Bun !== 'undefined' && Bun.semver) {
    try {
      // Sort versions in descending order to get the latest compatible version first
      const sortedVersions = [...availableVersions].sort((a, b) => {
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
          continue
        }
      }
    }
    catch {
      // Fall through to manual parsing
    }
  }

  // Manual constraint parsing for caret (^) constraints
  if (versionSpec.startsWith('^')) {
    const baseVersion = versionSpec.slice(1)
    const [major, minor, patch] = baseVersion.split('.')

    // Find versions compatible with the caret constraint
    const compatibleVersions = availableVersions.filter((v) => {
      const vParts = v.split('.')
      const vMajor = Number.parseInt(vParts[0] || '0')
      const vMinor = Number.parseInt(vParts[1] || '0')
      const vPatch = Number.parseInt(vParts[2] || '0')

      const reqMajor = Number.parseInt(major)
      const reqMinor = minor ? Number.parseInt(minor) : 0
      const reqPatch = patch ? Number.parseInt(patch) : 0

      // Caret allows patch and minor version updates within the same major version
      // For ^1.2.20, it should match 1.2.20 or higher, but not 1.1.x or 2.x.x
      if (vMajor !== reqMajor)
        return false

      // Compare version against requirement using proper semver logic
      // For ^1.2.20: must be >= 1.2.20 and < 2.0.0

      // If minor version is less than required, reject
      if (vMinor < reqMinor)
        return false

      // If minor version is greater than required, accept (e.g., 1.3.x satisfies ^1.2.20)
      if (vMinor > reqMinor)
        return true

      // Minor versions are equal, check patch
      // If patch is specified, it must be >= required patch
      if (patch && vPatch < reqPatch)
        return false

      return true
    })

    if (compatibleVersions.length > 0) {
      // Return the latest compatible version
      return compatibleVersions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0]
    }
  }

  // If constraint resolution fails, try the version as-is
  return versionSpec
}

describe('Bun Constraint Resolution Tests', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = join(tmpdir(), `bun-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    try {
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true })
      }
    }
    catch {
      // Ignore cleanup errors
    }
  })

  describe('Bun Version Constraint Resolution Logic', () => {
    // Use the global resolveBunVersionConstraint function which has the correct logic

    it('should resolve ^1.2.19 to 1.2.19 when available', async () => {
      const resolved = await resolveBunVersionConstraint('^1.2.19', ['1.2.19', '1.2.18', '1.2.17'])
      expect(resolved).toBe('1.2.19')
      expect(resolved).not.toBe('^1.2.19') // Should not return the constraint itself
    })

    it('should resolve ^1.2.18 to latest compatible version', async () => {
      const resolved = await resolveBunVersionConstraint('^1.2.18', ['1.2.19', '1.2.18', '1.2.17'])
      expect(resolved).toBe('1.2.19') // Should get the latest compatible version
    })

    it('should handle ^1.2.20 when only older versions are available', async () => {
      const resolved = await resolveBunVersionConstraint('^1.2.20', ['1.2.18', '1.2.17', '1.2.16'])
      expect(resolved).toBe('^1.2.20') // Should fall back to constraint when no compatible version
    })

    it('should return exact versions as-is', async () => {
      const testVersions = ['1.2.19', '1.2.18', '0.5.9', '2.0.0']

      for (const version of testVersions) {
        const resolved = await resolveBunVersionConstraint(version)
        expect(resolved).toBe(version)
      }
    })

    it('should handle latest and wildcard versions', async () => {
      const latestVersion = await resolveBunVersionConstraint('latest', ['1.2.19', '1.2.18'])
      const wildcardVersion = await resolveBunVersionConstraint('*', ['1.2.19', '1.2.18'])

      expect(latestVersion).toBe('1.2.19')
      expect(wildcardVersion).toBe('1.2.19')
    })

    it('should handle edge cases in version constraints', async () => {
      const availableVersions = ['1.2.19', '1.2.18', '1.2.17', '1.1.25', '1.0.50']

      // Test various constraint formats
      expect(await resolveBunVersionConstraint('^1.2', availableVersions)).toBe('1.2.19')
      expect(await resolveBunVersionConstraint('^1.1', availableVersions)).toBe('1.2.19') // Should get latest compatible (1.2.19 satisfies ^1.1)
      expect(await resolveBunVersionConstraint('^1.0', availableVersions)).toBe('1.2.19') // Should get latest 1.x
      expect(await resolveBunVersionConstraint('^2.0', availableVersions)).toBe('^2.0') // No compatible version
    })

    it('should handle the original bug scenario correctly', async () => {
      // This is the exact scenario that was failing before the fix
      // ^1.2.19 should resolve to 1.2.19, not cause "Not Found" error

      const resolved = await resolveBunVersionConstraint('^1.2.19', ['1.2.19', '1.2.18', '1.2.17'])

      // This should resolve to 1.2.19, not remain as ^1.2.19
      expect(resolved).toBe('1.2.19')
      expect(resolved).not.toBe('^1.2.19')

      // Verify the constraint is actually usable (not a string representation issue)
      expect(typeof resolved).toBe('string')
      expect(/^\d+\.\d+\.\d+$/.test(resolved)).toBe(true)
    })

    it('should handle version upgrades correctly', async () => {
      // Scenario: user has 1.2.18 installed and updates deps.yaml to ^1.2.19

      const resolved = await resolveBunVersionConstraint('^1.2.19', ['1.2.19', '1.2.18', '1.2.17'])

      // Should upgrade to the latest compatible version
      expect(resolved).toBe('1.2.19')
    })

    it('should work with Bun.semver when available', async () => {
      // This test verifies that the logic works with Bun's built-in semver
      if (typeof Bun !== 'undefined' && Bun.semver) {
        const resolved = await resolveBunVersionConstraint('^1.2.19')
        expect(resolved).toBe('1.2.19')
      }
      else {
        // If Bun.semver is not available, the manual parsing should work
        const resolved = await resolveBunVersionConstraint('^1.2.19')
        expect(resolved).toBe('1.2.19')
      }
    })
  })

  describe('GitHub Release Tag Parsing', () => {
    const parseGitHubReleaseTag = (tagName: string): string => {
      return tagName.replace(/^(bun-v?|v)/, '')
    }

    it('should parse various GitHub release tag formats correctly', () => {
      const testCases = [
        { input: 'bun-v1.2.19', expected: '1.2.19' },
        { input: 'v1.2.18', expected: '1.2.18' },
        { input: 'bun-1.2.17', expected: '1.2.17' },
        { input: '1.2.16', expected: '1.2.16' },
        { input: 'bun-v1.2.15', expected: '1.2.15' },
      ]

      testCases.forEach(({ input, expected }) => {
        expect(parseGitHubReleaseTag(input)).toBe(expected)
      })
    })

    it('should filter out non-semver versions', () => {
      const releases = [
        'bun-v1.2.19',
        'v1.2.18',
        'bun-1.2.17-beta',
        '1.2.16',
        'canary-build',
      ]

      const validVersions = releases
        .map(tag => parseGitHubReleaseTag(tag))
        .filter(version => /^\d+\.\d+\.\d+$/.test(version))

      expect(validVersions).toEqual(['1.2.19', '1.2.18', '1.2.16'])
    })
  })

  describe('Version Sorting', () => {
    it('should sort versions correctly', () => {
      const versions = ['1.2.16', '1.2.19', '1.2.17', '1.2.18', '1.1.25']

      const sorted = versions.sort((a, b) => {
        // Use Bun.semver if available, otherwise fallback to string comparison
        if (typeof Bun !== 'undefined' && Bun.semver) {
          try {
            return Bun.semver.order(b, a) // Descending order
          }
          catch {
            return b.localeCompare(a, undefined, { numeric: true })
          }
        }
        return b.localeCompare(a, undefined, { numeric: true })
      })

      expect(sorted[0]).toBe('1.2.19') // Latest should be first
      expect(sorted[sorted.length - 1]).toBe('1.1.25') // Oldest should be last
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid version specifications gracefully', async () => {
      const invalidSpecs = ['', 'invalid', '^^^1.2.3', 'not-a-version']

      for (const spec of invalidSpecs) {
        // Should not throw, should return the spec as-is
        expect(() => resolveBunVersionConstraint(spec)).not.toThrow()
      }
    })

    it('should handle empty available versions list', async () => {
      const resolved = await resolveBunVersionConstraint('^1.2.19', [])
      expect(resolved).toBe('^1.2.19') // Should fall back to constraint
    })
  })

  describe('Performance Tests', () => {
    it('should handle many versions efficiently', async () => {
      // Create a large list of versions
      const manyVersions = []
      for (let major = 1; major <= 2; major++) {
        for (let minor = 0; minor <= 50; minor++) {
          for (let patch = 0; patch <= 20; patch++) {
            manyVersions.push(`${major}.${minor}.${patch}`)
          }
        }
      }

      const startTime = performance.now()
      const resolved = await resolveBunVersionConstraint('^1.2.19', manyVersions)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // Should complete quickly
      expect(resolved).toBe('1.50.20') // Should find the latest compatible version in the generated set
    })
  })

  describe('Integration Scenarios', () => {
    it('should work with common constraint patterns', async () => {
      const commonConstraints = [
        { constraint: '^1.2.19', expected: '1.2.19' },
        { constraint: '^1.2.18', expected: '1.2.19' }, // Latest compatible
        { constraint: '1.2.18', expected: '1.2.18' }, // Exact
        { constraint: 'latest', expected: '1.2.19' },
        { constraint: '*', expected: '1.2.19' },
      ]

      for (const { constraint, expected } of commonConstraints) {
        const resolved = await resolveBunVersionConstraint(constraint, ['1.2.19', '1.2.18', '1.2.17'])
        expect(resolved).toBe(expected)
      }
    })

    it('should prevent the regression of the original bug', async () => {
      // The original bug: ^1.2.19 was not being resolved and causing "Not Found" errors

      const problematicConstraints = ['^1.2.19', '^1.2.18', '^1.1.0']

      for (const constraint of problematicConstraints) {
        const resolved = await resolveBunVersionConstraint(constraint)

        // Should resolve to a valid version, not remain as the constraint
        if (constraint === '^1.2.19') {
          expect(resolved).toBe('1.2.19')
        }
        else if (constraint === '^1.2.18') {
          expect(resolved).toBe('1.2.19') // Latest compatible
        }

        // Most importantly, should not remain as the original constraint
        expect(resolved).not.toBe(constraint)
      }
    })
  })
})
