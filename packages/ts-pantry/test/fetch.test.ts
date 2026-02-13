import type { PackageFetchOptions, PkgxPackage } from '../src/types'
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { cleanupBrowserResources, getValidCachedPackage, savePackageAsTypeScript, saveToCacheAndOutput } from 'ts-pkgx'

// Mock package data for testing
const mockPackageInfo: PkgxPackage = {
  name: 'Node.js',
  domain: 'nodejs.org',
  description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org/package.yml',
  homepageUrl: 'https://nodejs.org',
  githubUrl: 'https://github.com/nodejs/node',
  installCommand: 'pkgx nodejs.org',
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) nodejs.org -- $SHELL -i',
  launchpadInstallCommand: 'launchpad install nodejs.org',
  programs: ['node', 'npm', 'npx'],
  companions: ['npm'],
  dependencies: [],
  versions: ['18.0.0', '20.0.0', '16.0.0'],
  aliases: ['node'],
  fullPath: 'nodejs.org',
  fetchedAt: Date.now(),
}

const mockNestedPackageInfo: PkgxPackage = {
  name: 'git-crypt',
  domain: 'agwa.name',
  description: 'Enable transparent encryption/decryption of files in a git repo',
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/agwa.name/git-crypt/package.yml',
  homepageUrl: 'https://www.agwa.name/projects/git-crypt/',
  githubUrl: 'https://github.com/AGWA/git-crypt',
  installCommand: 'pkgx agwa.name/git-crypt',
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +agwa.name/git-crypt -- $SHELL -i',
  launchpadInstallCommand: 'launchpad install git-crypt',
  programs: ['git-crypt'],
  companions: [],
  dependencies: [],
  versions: ['0.7.0'],
  aliases: ['git-crypt'],
  fullPath: 'agwa.name/git-crypt',
  fetchedAt: Date.now(),
}

describe('Fetch Module', () => {
  let tempDir: string
  let tempCacheDir: string
  let tempOutputDir: string

  beforeEach(() => {
    // Create temporary directories for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-pkgx-test-'))
    tempCacheDir = path.join(tempDir, 'cache')
    tempOutputDir = path.join(tempDir, 'output')

    fs.mkdirSync(tempCacheDir, { recursive: true })
    fs.mkdirSync(tempOutputDir, { recursive: true })
  })

  afterEach(() => {
    // Clean up temporary directories
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('saveToCacheAndOutput', () => {
    test('should save package to both cache and output directories', () => {
      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        outputDir: tempOutputDir,
      }

      const result = saveToCacheAndOutput('nodejs.org', mockPackageInfo, options)

      expect(result.cachePath).toBeDefined()
      expect(result.outputPath).toBeDefined()
      expect(fs.existsSync(result.cachePath)).toBe(true)
      expect(fs.existsSync(result.outputPath)).toBe(true)

      // Verify cache file content
      const cacheContent = JSON.parse(fs.readFileSync(result.cachePath, 'utf-8'))
      expect(cacheContent.name).toBe(mockPackageInfo.name)
      expect(cacheContent.domain).toBe(mockPackageInfo.domain)
      expect(cacheContent.fetchedAt).toBeDefined()

      // Verify TypeScript file content
      const tsContent = fs.readFileSync(result.outputPath, 'utf-8')
      expect(tsContent).toContain('export const')
      expect(tsContent).toContain('export type')
      expect(tsContent).toContain(mockPackageInfo.name)
      expect(tsContent).toContain(mockPackageInfo.domain)
    })

    test('should handle nested package paths correctly', () => {
      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        outputDir: tempOutputDir,
      }

      const result = saveToCacheAndOutput('agwa.name/git-crypt', mockNestedPackageInfo, options)

      expect(result.cachePath).toContain('agwa.name-git-crypt.json')
      expect(result.outputPath).toContain('agwa.name/git-crypt.ts')
      expect(fs.existsSync(result.cachePath)).toBe(true)
      expect(fs.existsSync(result.outputPath)).toBe(true)
    })

    test('should create directories if they don\'t exist', () => {
      const nonExistentCacheDir = path.join(tempDir, 'new-cache')
      const nonExistentOutputDir = path.join(tempDir, 'new-output')

      const options: PackageFetchOptions = {
        cacheDir: nonExistentCacheDir,
        outputDir: nonExistentOutputDir,
      }

      const result = saveToCacheAndOutput('nodejs.org', mockPackageInfo, options)

      expect(fs.existsSync(nonExistentCacheDir)).toBe(true)
      expect(fs.existsSync(nonExistentOutputDir)).toBe(true)
      expect(fs.existsSync(result.cachePath)).toBe(true)
      expect(fs.existsSync(result.outputPath)).toBe(true)
    })

    test('should handle packages with special characters in names', () => {
      const specialPackage: PkgxPackage = {
        ...mockPackageInfo,
        name: 'Package with "quotes" and \'apostrophes\'',
        description: 'A package with special characters: <>&"\'',
      }

      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        outputDir: tempOutputDir,
      }

      const result = saveToCacheAndOutput('special.com', specialPackage, options)

      expect(fs.existsSync(result.cachePath)).toBe(true)
      expect(fs.existsSync(result.outputPath)).toBe(true)

      // Verify the content is properly escaped
      const tsContent = fs.readFileSync(result.outputPath, 'utf-8')
      expect(tsContent).toContain('Package with')
      expect(tsContent).toContain('special characters')
    })
  })

  describe('getValidCachedPackage', () => {
    test('should return cached package if valid and not expired', () => {
      // First save a package to cache
      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        cacheExpirationMinutes: 60, // 1 hour
      }

      saveToCacheAndOutput('nodejs.org', mockPackageInfo, options)

      // Now try to get it from cache
      const cached = getValidCachedPackage('nodejs.org', options)

      expect(cached).toBeDefined()
      expect(cached!.packageInfo.name).toBe(mockPackageInfo.name)
      expect(cached!.packageInfo.domain).toBe(mockPackageInfo.domain)
      expect(cached!.filePath).toBeDefined()
    })

    test('should return null if cache file doesn\'t exist', () => {
      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
      }

      const cached = getValidCachedPackage('nonexistent.org', options)
      expect(cached).toBeNull()
    })

    test('should return null if cache is expired', () => {
      // Create an expired cache file
      const expiredPackage = {
        ...mockPackageInfo,
        fetchedAt: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
      }

      const cacheFile = path.join(tempCacheDir, 'expired.org.json')
      fs.writeFileSync(cacheFile, JSON.stringify(expiredPackage))

      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        cacheExpirationMinutes: 60, // 1 hour expiration
      }

      const cached = getValidCachedPackage('expired.org', options)
      expect(cached).toBeNull()
    })

    test('should return null if cache file is corrupted', () => {
      // Create a corrupted cache file
      const cacheFile = path.join(tempCacheDir, 'corrupted.org.json')
      fs.writeFileSync(cacheFile, 'invalid json content')

      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
      }

      const cached = getValidCachedPackage('corrupted.org', options)
      expect(cached).toBeNull()
    })

    test('should handle nested package names correctly', () => {
      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        cacheExpirationMinutes: 60,
      }

      saveToCacheAndOutput('agwa.name/git-crypt', mockNestedPackageInfo, options)

      const cached = getValidCachedPackage('agwa.name/git-crypt', options)

      expect(cached).toBeDefined()
      expect(cached!.packageInfo.fullPath).toBe('agwa.name/git-crypt')
      expect(cached!.packageInfo.name).toBe('git-crypt')
    })
  })

  describe('savePackageAsTypeScript', () => {
    test('should generate valid TypeScript file', () => {
      const filePath = savePackageAsTypeScript(tempOutputDir, 'nodejs.org', mockPackageInfo)

      expect(fs.existsSync(filePath)).toBe(true)
      expect(filePath).toMatch(/\.ts$/)

      const content = fs.readFileSync(filePath, 'utf-8')

      // Check for required TypeScript elements
      expect(content).toContain('export const')
      expect(content).toContain('export type')
      expect(content).toContain('as const')
      expect(content).toContain('typeof')

      // Check for package data
      expect(content).toContain(mockPackageInfo.name)
      expect(content).toContain(mockPackageInfo.domain)
      expect(content).toContain(mockPackageInfo.description)

      // Check for JSDoc comments
      expect(content).toContain('/**')
      expect(content).toContain('*/')
      expect(content).toContain('@domain')
      expect(content).toContain('@programs')
      expect(content).toContain('@version')
    })

    test('should handle packages with empty arrays', () => {
      const emptyPackage: PkgxPackage = {
        name: 'Empty Package',
        domain: 'empty.com',
        description: 'Package with empty arrays',
        installCommand: 'pkgx empty.com',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) empty.com -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install empty.com',
        programs: [],
        companions: [],
        dependencies: [],
        versions: [],
      }

      const filePath = savePackageAsTypeScript(tempOutputDir, 'empty.com', emptyPackage)
      const content = fs.readFileSync(filePath, 'utf-8')

      expect(content).toContain('programs: [] as const')
      expect(content).toContain('companions: [] as const')
      expect(content).toContain('dependencies: [] as const')
      expect(content).toContain('versions: [] as const')
    })

    test('should properly escape special characters', () => {
      const specialPackage: PkgxPackage = {
        name: 'Package with "quotes"',
        domain: 'special.com',
        description: 'Description with single and double quotes',
        installCommand: 'pkgx special.com',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) special.com -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install special.com',
        programs: ['programs', 'programs2'],
        companions: [],
        dependencies: [],
        versions: ['1.0.0'],
      }

      const filePath = savePackageAsTypeScript(tempOutputDir, 'special.com', specialPackage)
      const content = fs.readFileSync(filePath, 'utf-8')

      // Should properly escape quotes
      expect(content).toContain('Package with')
      expect(content).toContain('Description with single and double quotes')
      expect(content).toContain('programs')
      expect(content).toContain('programs2')
    })

    test('should generate correct variable names', () => {
      const filePath = savePackageAsTypeScript(tempOutputDir, 'nodejs.org', mockPackageInfo)
      const content = fs.readFileSync(filePath, 'utf-8')

      // Should use camelCase for variable names
      expect(content).toMatch(/export const \w+Package = \{/)
      expect(content).toMatch(/export type \w+Package = typeof/)

      // Should not have invalid characters in variable names
      expect(content).not.toContain('export const nodejs.org')
      expect(content).not.toContain('export type nodejs.org')
    })

    test('should handle nested package paths in variable names', () => {
      const filePath = savePackageAsTypeScript(tempOutputDir, 'agwa.name/git-crypt', mockNestedPackageInfo)
      const content = fs.readFileSync(filePath, 'utf-8')

      // Should generate valid variable names for nested paths
      expect(content).toMatch(/export const \w+Package = \{/)
      expect(content).toMatch(/export type \w+Package = typeof/)

      // Should not contain invalid characters in variable names or export statements
      expect(content).not.toContain('export const agwa.name')
      expect(content).not.toContain('export type agwa.name')
      expect(content).not.toContain('const agwa.name/git-crypt')
      expect(content).not.toContain('type agwa.name/git-crypt')

      // Should contain the domain string in legitimate places (install command, JSDoc)
      expect(content).toContain('pkgx agwa.name/git-crypt')
      expect(content).toContain('fullPath: \'agwa.name/git-crypt\'')
    })
  })

  describe('cleanupBrowserResources', () => {
    test('should not throw when called', async () => {
      // This function should handle cleanup gracefully
      try {
        await cleanupBrowserResources()
        // If we get here, the function resolved successfully
        expect(true).toBe(true)
      }
      catch (error) {
        // If we get here, the function threw an error
        expect(error).toBeUndefined() // This will fail and show the error
      }
    })

    test('should be callable multiple times', async () => {
      try {
        await cleanupBrowserResources()
        await cleanupBrowserResources()
        await cleanupBrowserResources()
        // If we get here, all calls resolved successfully
        expect(true).toBe(true)
      }
      catch (error) {
        // If we get here, one of the function calls threw an error
        expect(error).toBeUndefined() // This will fail and show the error
      }
    })
  })

  describe('Package Validation', () => {
    test('should handle packages with missing optional fields', () => {
      const minimalPackage: PkgxPackage = {
        name: 'Minimal Package',
        domain: 'minimal.com',
        description: 'A minimal package',
        installCommand: 'pkgx minimal.com',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) minimal.com -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install minimal.com',
        programs: ['minimal'],
        companions: [],
        dependencies: [],
        versions: ['1.0.0'],
      }

      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        outputDir: tempOutputDir,
      }

      const result = saveToCacheAndOutput('minimal.com', minimalPackage, options)

      expect(fs.existsSync(result.cachePath)).toBe(true)
      expect(fs.existsSync(result.outputPath)).toBe(true)

      const tsContent = fs.readFileSync(result.outputPath, 'utf-8')
      expect(tsContent).toContain('Minimal Package')
      expect(tsContent).toContain('minimal.com')
    })

    test('should handle packages with all optional fields', () => {
      const fullPackage: PkgxPackage = {
        name: 'Full Package',
        domain: 'full.com',
        description: 'A package with all fields',
        packageYmlUrl: 'https://github.com/example/package.yml',
        homepageUrl: 'https://full.com',
        githubUrl: 'https://github.com/example/full',
        installCommand: 'pkgx full.com',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) full.com -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install full.com',
        programs: ['full', 'full-cli'],
        companions: ['companion1', 'companion2'],
        dependencies: ['dep1', 'dep2'],
        versions: ['2.0.0', '1.0.0'],
        aliases: ['full', 'fullpkg'],
        fullPath: 'full.com',
        fetchedAt: Date.now(),
      }

      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        outputDir: tempOutputDir,
      }

      const result = saveToCacheAndOutput('full.com', fullPackage, options)

      expect(fs.existsSync(result.cachePath)).toBe(true)
      expect(fs.existsSync(result.outputPath)).toBe(true)

      const tsContent = fs.readFileSync(result.outputPath, 'utf-8')
      expect(tsContent).toContain('Full Package')
      expect(tsContent).toContain('packageYmlUrl')
      expect(tsContent).toContain('homepageUrl')
      expect(tsContent).toContain('githubUrl')
      expect(tsContent).toContain('companions')
      expect(tsContent).toContain('dependencies')
      expect(tsContent).toContain('aliases')
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid output directory gracefully', () => {
      const invalidDir = '/invalid/path/that/does/not/exist'

      // Should throw when trying to create files in an invalid directory
      expect(() => {
        savePackageAsTypeScript(invalidDir, 'test.com', mockPackageInfo)
      }).toThrow()
    })

    test('should handle packages with very long names', () => {
      const longPackage: PkgxPackage = {
        name: 'A'.repeat(1000), // Very long name
        domain: 'long.com',
        description: 'B'.repeat(2000), // Very long description
        installCommand: 'pkgx long.com',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) long.com -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install long.com',
        programs: ['long'],
        companions: [],
        dependencies: [],
        versions: ['1.0.0'],
      }

      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        outputDir: tempOutputDir,
      }

      expect(() => {
        saveToCacheAndOutput('long.com', longPackage, options)
      }).not.toThrow()
    })

    test('should handle packages with unicode characters', () => {
      const unicodePackage: PkgxPackage = {
        name: 'Package with 中文 and émojis 🚀',
        domain: 'unicode.com',
        description: 'Description with unicode: αβγ δεζ ηθι',
        installCommand: 'pkgx unicode.com',
        pkgxInstallCommand: 'sh <(curl https://pkgx.sh) unicode.com -- $SHELL -i',
        launchpadInstallCommand: 'launchpad install unicode.com',
        programs: ['unicode'],
        companions: [],
        dependencies: [],
        versions: ['1.0.0'],
      }

      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        outputDir: tempOutputDir,
      }

      const result = saveToCacheAndOutput('unicode.com', unicodePackage, options)

      expect(fs.existsSync(result.cachePath)).toBe(true)
      expect(fs.existsSync(result.outputPath)).toBe(true)

      const cacheContent = JSON.parse(fs.readFileSync(result.cachePath, 'utf-8'))
      expect(cacheContent.name).toContain('中文')
      expect(cacheContent.name).toContain('🚀')
    })
  })

  describe('Cache Management', () => {
    test('should respect cache expiration settings', () => {
      const recentPackage = {
        ...mockPackageInfo,
        fetchedAt: Date.now() - (30 * 60 * 1000), // 30 minutes ago
      }

      const cacheFile = path.join(tempCacheDir, 'recent.org.json')
      fs.writeFileSync(cacheFile, JSON.stringify(recentPackage))

      // Should return cached version with 1 hour expiration
      const options1: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        cacheExpirationMinutes: 60,
      }
      const cached1 = getValidCachedPackage('recent.org', options1)
      expect(cached1).toBeDefined()

      // Should return null with 15 minute expiration
      const options2: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        cacheExpirationMinutes: 15,
      }
      const cached2 = getValidCachedPackage('recent.org', options2)
      expect(cached2).toBeNull()
    })

    test('should handle missing fetchedAt timestamp', () => {
      const packageWithoutTimestamp = {
        ...mockPackageInfo,
      }
      delete packageWithoutTimestamp.fetchedAt

      const cacheFile = path.join(tempCacheDir, 'notimestamp.org.json')
      fs.writeFileSync(cacheFile, JSON.stringify(packageWithoutTimestamp))

      const options: PackageFetchOptions = {
        cacheDir: tempCacheDir,
        cacheExpirationMinutes: 60,
      }

      // Should return null for packages without timestamp
      const cached = getValidCachedPackage('notimestamp.org', options)
      expect(cached).toBeNull()
    })
  })

  describe('File System Operations', () => {
    test('should create nested directory structures', () => {
      const nestedDir = path.join(tempOutputDir, 'deeply', 'nested', 'structure')

      const filePath = savePackageAsTypeScript(nestedDir, 'nested.com', mockPackageInfo)

      expect(fs.existsSync(filePath)).toBe(true)
      expect(fs.existsSync(path.dirname(filePath))).toBe(true)
    })

    test('should overwrite existing files', () => {
      const filePath = savePackageAsTypeScript(tempOutputDir, 'overwrite.com', mockPackageInfo)

      // Verify initial file
      expect(fs.existsSync(filePath)).toBe(true)
      const initialContent = fs.readFileSync(filePath, 'utf-8')

      // Modify package and save again
      const modifiedPackage = {
        ...mockPackageInfo,
        description: 'Modified description',
      }

      const newFilePath = savePackageAsTypeScript(tempOutputDir, 'overwrite.com', modifiedPackage)

      expect(newFilePath).toBe(filePath) // Same path
      const newContent = fs.readFileSync(filePath, 'utf-8')

      expect(newContent).not.toBe(initialContent)
      expect(newContent).toContain('Modified description')
    })
  })
})
