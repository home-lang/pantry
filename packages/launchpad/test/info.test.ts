import { describe, expect, it } from 'bun:test'
import { formatPackageInfo, formatPackageNotFound, getDetailedPackageInfo, packageExists } from '../src/info'

describe('Info Functionality', () => {
  describe('packageExists', () => {
    it('should return true for existing packages', () => {
      expect(packageExists('go')).toBe(true)
      expect(packageExists('perl')).toBe(true)
      expect(packageExists('nodejs.org')).toBe(true)
    })

    it('should return false for non-existing packages', () => {
      expect(packageExists('non-existent-package')).toBe(false)
      expect(packageExists('fake.domain.com')).toBe(false)
      expect(packageExists('')).toBe(false)
    })
  })

  describe('getDetailedPackageInfo', () => {
    it('should get basic package info', () => {
      const info = getDetailedPackageInfo('go')
      expect(info).toBeDefined()
      expect(info?.name).toBe('go.dev')
      expect(info?.domain).toBe('go.dev')
      expect(typeof info?.totalVersions).toBe('number')
    })

    it('should include versions when requested', () => {
      const infoWithoutVersions = getDetailedPackageInfo('go', { includeVersions: false })
      const infoWithVersions = getDetailedPackageInfo('go', { includeVersions: true })

      expect(infoWithoutVersions?.versions).toBeUndefined()
      expect(infoWithVersions?.versions).toBeDefined()
      expect(Array.isArray(infoWithVersions?.versions)).toBe(true)
    })

    it('should respect maxVersions limit', () => {
      const info = getDetailedPackageInfo('go', { includeVersions: true, maxVersions: 3 })

      if (info?.versions) {
        expect(info.versions.length).toBeLessThanOrEqual(3)
      }
    })

    it('should return null for non-existing packages', () => {
      const info = getDetailedPackageInfo('non-existent-package')
      expect(info).toBeNull()
    })

    it('should include all metadata fields', () => {
      const info = getDetailedPackageInfo('go')

      if (info) {
        expect(info.name).toBeDefined()
        expect(info.domain).toBeDefined()
        expect(typeof info.totalVersions).toBe('number')
        // Optional fields might be undefined, but should be present in the interface
        expect('description' in info).toBe(true)
        expect('latestVersion' in info).toBe(true)
        expect('programs' in info).toBe(true)
        expect('dependencies' in info).toBe(true)
        expect('companions' in info).toBe(true)
      }
    })
  })

  describe('formatPackageInfo', () => {
    const mockInfo = {
      name: 'test-package',
      domain: 'test.com',
      description: 'A test package for testing',
      latestVersion: '2.1.0',
      totalVersions: 10,
      programs: ['test', 'test-cli', 'test-runner'],
      dependencies: ['dep1.com', 'dep2.org'],
      companions: ['companion1.com', 'companion2.org'],
      versions: ['2.1.0', '2.0.0', '1.9.0', '1.8.0'],
    }

    it('should format full package info', () => {
      const formatted = formatPackageInfo(mockInfo)

      expect(formatted).toContain('📦 Package Information')
      expect(formatted).toContain('Name: test-package')
      expect(formatted).toContain('Domain: test.com')
      expect(formatted).toContain('Description: A test package for testing')
      expect(formatted).toContain('Latest Version: 2.1.0')
      expect(formatted).toContain('Total Versions: 10')
      expect(formatted).toContain('launchpad install test-package')
    })

    it('should format compact package info', () => {
      const formatted = formatPackageInfo(mockInfo, { compact: true })

      expect(formatted).toContain('📦 test-package (test.com) - A test package for testing')
      expect(formatted).toContain('Latest: 2.1.0')
      expect(formatted).not.toContain('Package Information') // No full header in compact mode
    })

    it('should show versions when enabled', () => {
      const infoWithVersions = { ...mockInfo, versions: ['2.1.0', '2.0.0', '1.9.0'] }
      const formatted = formatPackageInfo(infoWithVersions, { showVersions: true })

      expect(formatted).toContain('Available Versions:')
      expect(formatted).toContain('• 2.1.0 (latest)')
      expect(formatted).toContain('• 2.0.0')
      expect(formatted).toContain('• 1.9.0')
    })

    it('should hide versions when disabled', () => {
      const infoWithVersions = { ...mockInfo, versions: ['2.1.0', '2.0.0'] }
      const formatted = formatPackageInfo(infoWithVersions, { showVersions: false })

      expect(formatted).not.toContain('Available Versions:')
      expect(formatted).not.toContain('• 2.1.0 (latest)')
    })

    it('should show programs when enabled', () => {
      const formatted = formatPackageInfo(mockInfo, { showPrograms: true })

      expect(formatted).toContain('Programs:')
      expect(formatted).toContain('• test')
      expect(formatted).toContain('• test-cli')
      expect(formatted).toContain('• test-runner')
    })

    it('should hide programs when disabled', () => {
      const formatted = formatPackageInfo(mockInfo, { showPrograms: false })

      expect(formatted).not.toContain('Programs:')
      expect(formatted).not.toContain('• test')
    })

    it('should show dependencies when enabled', () => {
      const formatted = formatPackageInfo(mockInfo, { showDependencies: true })

      expect(formatted).toContain('Dependencies:')
      expect(formatted).toContain('• dep1.com')
      expect(formatted).toContain('• dep2.org')
    })

    it('should hide dependencies when disabled', () => {
      const formatted = formatPackageInfo(mockInfo, { showDependencies: false })

      expect(formatted).not.toContain('Dependencies:')
      expect(formatted).not.toContain('• dep1.com')
    })

    it('should show companions when enabled', () => {
      const formatted = formatPackageInfo(mockInfo, { showCompanions: true })

      expect(formatted).toContain('Companion Packages:')
      expect(formatted).toContain('• companion1.com')
      expect(formatted).toContain('• companion2.org')
    })

    it('should hide companions when disabled', () => {
      const formatted = formatPackageInfo(mockInfo, { showCompanions: false })

      expect(formatted).not.toContain('Companion Packages:')
      expect(formatted).not.toContain('• companion1.com')
    })

    it('should handle missing optional fields gracefully', () => {
      const minimalInfo = {
        name: 'minimal-package',
        domain: 'minimal.com',
        totalVersions: 0,
      }

      const formatted = formatPackageInfo(minimalInfo)

      expect(formatted).toContain('Name: minimal-package')
      expect(formatted).toContain('Domain: minimal.com')
      expect(formatted).not.toContain('Description:')
      expect(formatted).not.toContain('Latest Version:')
      expect(formatted).not.toContain('Programs:')
      expect(formatted).not.toContain('Dependencies:')
      expect(formatted).not.toContain('Companion Packages:')
    })

    it('should truncate long version lists', () => {
      const manyVersions = Array.from({ length: 15 }, (_, i) => `1.${i}.0`)
      const infoWithManyVersions = { ...mockInfo, versions: manyVersions }

      const formatted = formatPackageInfo(infoWithManyVersions, { showVersions: true })

      expect(formatted).toContain('Available Versions:')
      expect(formatted).toContain('... and 5 more') // Should show truncation message
    })

    it('should include installation commands', () => {
      const formatted = formatPackageInfo(mockInfo)

      expect(formatted).toContain('Installation:')
      expect(formatted).toContain('launchpad install test-package')
      expect(formatted).toContain('launchpad install test-package@2.1.0')
    })
  })

  describe('formatPackageNotFound', () => {
    it('should format package not found message', async () => {
      const formatted = await formatPackageNotFound('non-existent-package')

      expect(formatted).toContain('❌ Package \'non-existent-package\' not found.')
      expect(formatted).toContain('Use "launchpad search <term>" to find')
    })

    it('should include suggestions when available', async () => {
      // Test with a typo of a real package
      const formatted = await formatPackageNotFound('g') // partial match for 'go'

      expect(formatted).toContain('❌ Package \'g\' not found.')

      // Should include suggestions section if any are found
      if (formatted.includes('Did you mean one of these?')) {
        expect(formatted).toContain('•')
      }
    })

    it('should handle empty package name', async () => {
      const formatted = await formatPackageNotFound('')

      expect(formatted).toContain('❌ Package \'\' not found.')
      expect(formatted).toContain('Use "launchpad search <term>" to find available packages.')
    })
  })
})
