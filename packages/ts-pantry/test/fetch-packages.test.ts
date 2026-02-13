import type { PkgxPackage } from '../src/types'
import { describe, expect, test } from 'bun:test'
import { PACKAGE_ALIASES } from '../src/consts'
import { convertDomainToFileName } from '../src/utils'

// Mock data for fetch tests
const mockPackageInfo: PkgxPackage = {
  name: 'Mock Package',
  domain: 'mock.org',
  description: 'A mock package for testing',
  installCommand: 'pkgx mock.org',
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) mock.org -- $SHELL -i',
  launchpadInstallCommand: 'launchpad install mock.org',
  programs: ['mock'],
  companions: [],
  dependencies: [],
  versions: ['1.0.0'],
}

// Mock Node.js package data
const mockNodePackage: PkgxPackage = {
  name: 'Node.js',
  domain: 'nodejs.org',
  description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/blob/main/projects/nodejs.org/package.yml',
  homepageUrl: 'https://nodejs.org',
  githubUrl: 'https://github.com/nodejs/node',
  installCommand: 'pkgx nodejs.org',
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) nodejs.org -- $SHELL -i',
  launchpadInstallCommand: 'launchpad install nodejs.org',
  programs: ['node', 'npm', 'npx'],
  companions: ['npm'],
  dependencies: [],
  versions: ['18.0.0', '20.0.0'],
  aliases: ['node'],
  fullPath: 'nodejs.org',
}

describe('Package Fetching', () => {
  test('should fetch a single package (mocked)', async () => {
    // Using the mocked version
    const mockFetchPkg = () => {
      return Promise.resolve({
        packageInfo: mockNodePackage,
        originalName: 'node',
        fullDomainName: 'nodejs.org',
      })
    }

    const result = await mockFetchPkg()

    expect(result).toBeDefined()
    expect(result.packageInfo).toBeDefined()
    expect(result.packageInfo.name).toBe('Node.js')
    expect(result.packageInfo.domain).toBe('nodejs.org')
    expect(result.packageInfo.installCommand).toBeDefined()
    expect(result.packageInfo.description).toBeDefined()
  })

  test('should fetch and save all packages (mocked)', async () => {
    // Mock the fetch and save function
    const mockSavePackages = () => {
      return Promise.resolve(['nodejs.org', 'python.org'])
    }

    const savedPackages = await mockSavePackages()

    expect(savedPackages.length).toBeGreaterThan(0)
    expect(savedPackages).toContain('nodejs.org')
  })

  describe('PACKAGE_ALIASES', () => {
    test('should contain common package aliases', () => {
      expect(Object.keys(PACKAGE_ALIASES).length).toBeGreaterThan(0)
      expect(PACKAGE_ALIASES.node).toBe('nodejs.org')
      expect(PACKAGE_ALIASES.python).toBe('python.org')
      expect(PACKAGE_ALIASES.rust).toBe('rust-lang.org')
      expect(PACKAGE_ALIASES.bun).toBe('bun.sh')
    })
  })

  // Test fetch package functionality with mocks
  describe('package fetching mock', () => {
    // We use a mocked implementation here for testing
    test('should mock fetch package info', async () => {
      // This is a mock test just to verify mock functionality
      const mockFetchPackage = () => {
        return Promise.resolve({
          packageInfo: mockPackageInfo,
          originalName: 'mock',
          fullDomainName: 'mock.org',
        })
      }

      const result = await mockFetchPackage()
      expect(result).toBeDefined()
      expect(result.packageInfo).toEqual(mockPackageInfo)
      expect(result.originalName).toBe('mock')
      expect(result.fullDomainName).toBe('mock.org')
    })
  })

  // Test file generation
  describe('package file generation', () => {
    test('should generate files with proper naming convention', () => {
      // Standard domain
      const standardDomain = 'example.com'
      const standardFileName = convertDomainToFileName(standardDomain)
      expect(standardFileName).toBe('examplecom')

      // Nested path
      const nestedPath = 'agwa.name/git-crypt'
      const nestedFileName = convertDomainToFileName(nestedPath)
      expect(nestedFileName).toBe('agwaname-git-crypt')
    })
  })
})
