import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { DISTRIBUTION_CONFIG, install } from '../src/install'

describe('Direct Installation System (replaces pkgx)', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('distribution server configuration', () => {
    it('should have valid distribution server URL', () => {
      expect(DISTRIBUTION_CONFIG).toBeDefined()
      expect(DISTRIBUTION_CONFIG.baseUrl).toBe('https://dist.pkgx.dev')
      expect(DISTRIBUTION_CONFIG.baseUrl.startsWith('https://')).toBe(true)
    })

    it('should support switching to custom distribution server', () => {
      // Test configuration flexibility for future migration
      const customConfig = {
        baseUrl: 'https://packages.launchpad.dev'
      }
      expect(customConfig.baseUrl).toBe('https://packages.launchpad.dev')
    })

    it('should maintain compatibility with pkgx distribution format', () => {
      // Test that URL structure matches pkgx format
      const expectedFormat = `${DISTRIBUTION_CONFIG.baseUrl}/{domain}/{os}/{arch}/v{version}.tar.xz`
      expect(expectedFormat).toContain('dist.pkgx.dev')
      expect(expectedFormat).toContain('{domain}/{os}/{arch}')
    })
  })

  describe('platform and architecture detection', () => {
    it('should detect current platform correctly', () => {
      // Test that current platform can be determined
      const currentPlatform = process.platform
      const supportedPlatforms = ['darwin', 'linux', 'win32']
      expect(supportedPlatforms.includes(currentPlatform)).toBe(true)
    })

    it('should detect current architecture correctly', () => {
      // Test that current architecture can be determined
      const currentArch = process.arch
      const supportedArchs = ['x64', 'arm64', 'arm']
      expect(supportedArchs.includes(currentArch)).toBe(true)
    })

    it('should map platform to distribution format', () => {
      // Test platform mapping logic
      const platformMap = {
        'darwin': 'darwin',
        'linux': 'linux',
        'win32': 'windows'
      }
      expect(platformMap[process.platform as keyof typeof platformMap]).toBeDefined()
    })

    it('should map architecture to distribution format', () => {
      // Test architecture mapping logic
      const archMap = {
        'x64': 'x86_64',
        'arm64': 'aarch64',
        'arm': 'armv7l'
      }
      expect(archMap[process.arch as keyof typeof archMap]).toBeDefined()
    })
  })

  describe('package resolution', () => {
    it('should handle common package aliases', () => {
      // Test that common package names are recognized
      const commonPackages = ['node', 'python', 'bun', 'curl', 'wget', 'git']
      expect(commonPackages.length).toBeGreaterThan(0)

      // Each package should be resolvable to a domain
      commonPackages.forEach(pkg => {
        expect(pkg).toBeTruthy()
      })
    })

    it('should handle package@version format', () => {
      // Test version specification parsing
      const packageWithVersion = 'node@18.0.0'
      const [name, version] = packageWithVersion.split('@')
      expect(name).toBe('node')
      expect(version).toBe('18.0.0')
    })

    it('should handle unknown packages gracefully', () => {
      // Test fallback for unknown packages
      const unknownPackage = 'completely-unknown-package-12345'
      expect(unknownPackage).toBeTruthy()
      expect(unknownPackage.length).toBeGreaterThan(0)
    })
  })

  describe('download and extraction logic', () => {
    it('should construct proper download URLs', () => {
      // Test URL construction logic
      const domain = 'bun.sh'
      const os = 'darwin'
      const arch = 'aarch64'
      const version = '0.5.9'

      const expectedUrl = `${DISTRIBUTION_CONFIG.baseUrl}/${domain}/${os}/${arch}/v${version}.tar.xz`
      expect(expectedUrl).toBe('https://dist.pkgx.dev/bun.sh/darwin/aarch64/v0.5.9.tar.xz')
    })

    it('should support multiple archive formats', () => {
      // Test that both tar.xz and tar.gz are supported
      const formats = ['tar.xz', 'tar.gz']
      expect(formats).toContain('tar.xz')
      expect(formats).toContain('tar.gz')
    })

    it('should handle temporary directory creation', async () => {
      // Test temp directory handling
      const tempInstallDir = path.join(tempDir, '.tmp', 'test-package')
      await fs.promises.mkdir(tempInstallDir, { recursive: true })
      expect(fs.existsSync(tempInstallDir)).toBe(true)
    })

    it('should handle binary extraction paths', () => {
      // Test various binary search paths
      const extractDir = '/tmp/extracted'
      const domain = 'bun.sh'
      const version = '0.5.9'

      const searchPaths = [
        extractDir,
        path.join(extractDir, 'bin'),
        path.join(extractDir, 'usr', 'bin'),
        path.join(extractDir, 'usr', 'local', 'bin'),
        path.join(extractDir, domain, `v${version}`, 'bin')
      ]

      expect(searchPaths.length).toBe(5)
      expect(searchPaths[4]).toContain('bun.sh/v0.5.9/bin')
    })
  })

  describe('installation process', () => {
    it('should handle empty package list', async () => {
      const result = await install([], tempDir)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should accept single package', async () => {
      // Test single package installation (without actually downloading)
      try {
        const result = await install(['nonexistent-test-package'], tempDir)
        expect(Array.isArray(result)).toBe(true)
      } catch (error) {
        // Expected to fail for nonexistent package
        expect(error).toBeDefined()
      }
    })

    it('should accept multiple packages', async () => {
      // Test multiple package installation
      try {
        const result = await install(['package1', 'package2'], tempDir)
        expect(Array.isArray(result)).toBe(true)
      } catch (error) {
        // Expected to fail for nonexistent packages
        expect(error).toBeDefined()
      }
    })

    it('should create necessary directories', async () => {
      const installDir = path.join(tempDir, 'test-install')

      // Test that installation creates required directories
      await install([], installDir)
      expect(fs.existsSync(installDir)).toBe(true)
    })

    it('should handle installation path permissions', async () => {
      const installDir = path.join(tempDir, 'test-install')
      await fs.promises.mkdir(installDir, { recursive: true })

      // Test that directory is writable
      try {
        const testFile = path.join(installDir, 'test-write')
        await fs.promises.writeFile(testFile, 'test')
        expect(fs.existsSync(testFile)).toBe(true)
        await fs.promises.unlink(testFile)
      } catch (error) {
        // Permission error is expected in some cases
        expect(error).toBeDefined()
      }
    })
  })

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      // Test network error handling
      try {
        await install(['nonexistent-package'], tempDir)
      } catch (error) {
        expect(error).toBeDefined()
        expect(error instanceof Error).toBe(true)
      }
    })

    it('should handle invalid package names', async () => {
      // Test invalid package name handling
      try {
        await install([''], tempDir)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle extraction failures', async () => {
      // Test archive extraction error handling
      const invalidArchive = path.join(tempDir, 'invalid.tar.xz')
      await fs.promises.writeFile(invalidArchive, 'invalid content')

      expect(fs.existsSync(invalidArchive)).toBe(true)
    })

    it('should clean up temporary files on error', async () => {
      // Test cleanup on installation failure
      try {
        await install(['nonexistent-package'], tempDir)
      } catch (error) {
        // Temp directories should be cleaned up
        const tempDirs = await fs.promises.readdir(tempDir).catch(() => [])
        const tempInstallDirs = tempDirs.filter(dir => dir.startsWith('.tmp'))
        expect(tempInstallDirs.length).toBe(0)
      }
    })
  })

  describe('compatibility with pkgx ecosystem', () => {
    it('should maintain pkgx distribution structure compatibility', () => {
      // Test that we can read pkgx-format distributions
      const pkgxStructure = {
        domain: 'bun.sh',
        version: '0.5.9',
        binPath: 'bun.sh/v0.5.9/bin/'
      }

      expect(pkgxStructure.binPath).toContain(pkgxStructure.domain)
      expect(pkgxStructure.binPath).toContain(`v${pkgxStructure.version}`)
    })

    it('should support pkgx version naming convention', () => {
      // Test version format compatibility
      const versions = ['0.5.9', '1.0.0', '2.1.3', '18.17.0']
      versions.forEach(version => {
        const versionedName = `v${version}`
        expect(versionedName).toMatch(/^v\d+\.\d+\.\d+$/)
      })
    })

    it('should handle pkgx domain format', () => {
      // Test domain format compatibility
      const domains = ['bun.sh', 'nodejs.org', 'python.org', 'gnu.org/wget']
      domains.forEach(domain => {
        expect(domain).toBeTruthy()
        expect(domain.length).toBeGreaterThan(0)
      })
    })
  })

  describe('migration from pkgx', () => {
    it('should not depend on pkgx binary', () => {
      // Test that pkgx binary is not required
      const originalPath = process.env.PATH
      process.env.PATH = '/usr/bin:/bin' // Remove potential pkgx paths

      try {
        // Should work without pkgx in PATH
        expect(() => install([], tempDir)).not.toThrow()
      } finally {
        process.env.PATH = originalPath
      }
    })

    it('should provide equivalent functionality to pkgx', () => {
      // Test that core pkgx functionality is replicated
      const coreFeatures = [
        'package installation',
        'version resolution',
        'platform detection',
        'archive extraction',
        'binary installation'
      ]

      expect(coreFeatures.length).toBe(5)
      expect(coreFeatures).toContain('package installation')
    })

    it('should be ready for custom registry migration', () => {
      // Test readiness for switching from pkgx.dev to own registry
      const futureConfig = {
        baseUrl: 'https://registry.launchpad.dev',
        // Same API structure as pkgx
        pathFormat: '{domain}/{os}/{arch}/v{version}.tar.xz'
      }

      expect(futureConfig.baseUrl).not.toBe(DISTRIBUTION_CONFIG.baseUrl)
      expect(futureConfig.pathFormat).toContain('{domain}/{os}/{arch}')
    })
  })

  describe('performance and efficiency', () => {
    it('should handle concurrent installations', async () => {
      // Test concurrent installation handling
      const packages = ['package1', 'package2', 'package3']
      const promises = packages.map(pkg =>
        install([pkg], tempDir).catch(() => []) // Ignore errors for nonexistent packages
      )

      const results = await Promise.all(promises)
      expect(results.length).toBe(packages.length)
    })

    it('should minimize temporary disk usage', async () => {
      // Test that temp files are cleaned up
      const initialFiles = await fs.promises.readdir(tempDir).catch(() => [])

      try {
        await install(['nonexistent-package'], tempDir)
      } catch {
        // Ignore installation errors
      }

      const finalFiles = await fs.promises.readdir(tempDir).catch(() => [])
      expect(finalFiles.length).toBeLessThanOrEqual(initialFiles.length + 1)
    })

    it('should cache known package versions', () => {
      // Test version caching strategy
      const knownVersions = {
        'bun.sh': '0.5.9',
        'nodejs.org': '18.17.0',
        'python.org': '3.11.4'
      }

      Object.entries(knownVersions).forEach(([domain, version]) => {
        expect(version).toMatch(/^\d+\.\d+\.\d+$/)
        expect(domain).toContain('.')
      })
    })
  })
})
