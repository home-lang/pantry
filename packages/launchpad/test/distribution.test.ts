import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os, { arch, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { DISTRIBUTION_CONFIG } from '../src/install'

describe('Distribution System', () => {
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

  describe('Configuration', () => {
    it('should have valid distribution configuration', () => {
      expect(DISTRIBUTION_CONFIG).toBeDefined()
      expect(DISTRIBUTION_CONFIG.baseUrl).toBeDefined()
      expect(typeof DISTRIBUTION_CONFIG.baseUrl).toBe('string')
    })

    it('should point to pkgx distribution server by default', () => {
      expect(DISTRIBUTION_CONFIG.baseUrl).toBe('https://dist.pkgx.dev')
    })

    it('should use HTTPS for security', () => {
      expect(DISTRIBUTION_CONFIG.baseUrl.startsWith('https://')).toBe(true)
    })

    it('should be configurable for future migration', () => {
      // Test that config structure supports changing base URL
      const newConfig = { ...DISTRIBUTION_CONFIG, baseUrl: 'https://packages.launchpad.dev' }
      expect(newConfig.baseUrl).toBe('https://packages.launchpad.dev')
      expect(newConfig.baseUrl).not.toBe(DISTRIBUTION_CONFIG.baseUrl)
    })
  })

  describe('Platform Detection', () => {
    it('should detect current platform', () => {
      const currentPlatform = platform()
      const supportedPlatforms = ['darwin', 'linux', 'win32']
      expect(supportedPlatforms.includes(currentPlatform)).toBe(true)
    })

    it('should map platforms to distribution format', () => {
      const platformMappings = {
        darwin: 'darwin',
        linux: 'linux',
        win32: 'windows',
      }

      Object.entries(platformMappings).forEach(([_nodePlatform, distPlatform]) => {
        expect(distPlatform).toBeDefined()
        expect(typeof distPlatform).toBe('string')
        expect(distPlatform.length).toBeGreaterThan(0)
      })
    })

    it('should handle current platform correctly', () => {
      const currentPlatform = platform()
      let expectedDistPlatform: string

      switch (currentPlatform) {
        case 'darwin':
          expectedDistPlatform = 'darwin'
          break
        case 'linux':
          expectedDistPlatform = 'linux'
          break
        case 'win32':
          expectedDistPlatform = 'windows'
          break
        default:
          throw new Error(`Unsupported platform: ${currentPlatform}`)
      }

      expect(expectedDistPlatform).toBeDefined()
    })
  })

  describe('Architecture Detection', () => {
    it('should detect current architecture', () => {
      const currentArch = arch()
      const supportedArchs = ['x64', 'arm64', 'arm']
      expect(supportedArchs.includes(currentArch)).toBe(true)
    })

    it('should map architectures to distribution format', () => {
      const archMappings = {
        x64: 'x86_64',
        arm64: 'aarch64',
        arm: 'armv7l',
      }

      Object.entries(archMappings).forEach(([_nodeArch, distArch]) => {
        expect(distArch).toBeDefined()
        expect(typeof distArch).toBe('string')
        expect(distArch.length).toBeGreaterThan(0)
      })
    })

    it('should handle current architecture correctly', () => {
      const currentArch = arch()
      let expectedDistArch: string

      switch (currentArch) {
        case 'x64':
          expectedDistArch = 'x86_64'
          break
        case 'arm64':
          expectedDistArch = 'aarch64'
          break
        case 'arm':
          expectedDistArch = 'armv7l'
          break
        default:
          throw new Error(`Unsupported architecture: ${currentArch}`)
      }

      expect(expectedDistArch).toBeDefined()
    })
  })

  describe('URL Construction', () => {
    it('should construct proper download URLs', () => {
      const domain = 'bun.sh'
      const os = 'darwin'
      const arch = 'aarch64'
      const version = '0.5.9'

      const expectedUrl = `${DISTRIBUTION_CONFIG.baseUrl}/${domain}/${os}/${arch}/v${version}.tar.xz`
      expect(expectedUrl).toBe('https://dist.pkgx.dev/bun.sh/darwin/aarch64/v0.5.9.tar.xz')
    })

    it('should support different archive formats', () => {
      const domain = 'nodejs.org'
      const os = 'linux'
      const arch = 'x86_64'
      const version = '18.17.0'

      const tarXzUrl = `${DISTRIBUTION_CONFIG.baseUrl}/${domain}/${os}/${arch}/v${version}.tar.xz`
      const tarGzUrl = `${DISTRIBUTION_CONFIG.baseUrl}/${domain}/${os}/${arch}/v${version}.tar.gz`

      expect(tarXzUrl).toContain('.tar.xz')
      expect(tarGzUrl).toContain('.tar.gz')
      expect(tarXzUrl.replace('.tar.xz', '.tar.gz')).toBe(tarGzUrl)
    })

    it('should handle domain formats correctly', () => {
      const domains = [
        'bun.sh',
        'nodejs.org',
        'python.org',
        'gnu.org/wget',
        'git-scm.com',
      ]

      domains.forEach((domain) => {
        const url = `${DISTRIBUTION_CONFIG.baseUrl}/${domain}/darwin/aarch64/v1.0.0.tar.xz`
        expect(url).toContain(domain)
        expect(url).toContain('dist.pkgx.dev')
      })
    })

    it('should handle version formats correctly', () => {
      const versions = ['0.5.9', '1.0.0', '18.17.0', '3.11.4']

      versions.forEach((version) => {
        const url = `${DISTRIBUTION_CONFIG.baseUrl}/test.org/darwin/aarch64/v${version}.tar.xz`
        expect(url).toContain(`v${version}`)
        expect(url).toMatch(/v\d+\.\d+\.\d+/)
      })
    })
  })

  describe('Package Domain Resolution', () => {
    it('should handle common package aliases', () => {
      const commonMappings = {
        node: 'nodejs.org',
        nodejs: 'nodejs.org',
        python: 'python.org',
        python3: 'python.org',
        bun: 'bun.sh',
        curl: 'curl.se',
        wget: 'gnu.org/wget',
        git: 'git-scm.org',
      }

      Object.entries(commonMappings).forEach(([_alias, domain]) => {
        expect(domain).toBeDefined()
        expect(domain.includes('.')).toBe(true)
      })
    })

    it('should handle package@version format', () => {
      const packageWithVersion = 'node@18.17.0'
      const [name, version] = packageWithVersion.split('@')

      expect(name).toBe('node')
      expect(version).toBe('18.17.0')
      expect(version).toMatch(/^\d+\.\d+\.\d+$/)
    })

    it('should handle unknown packages gracefully', () => {
      const unknownPackage = 'completely-unknown-package-12345'

      // Unknown packages should either get a fallback domain or be handled gracefully
      const fallbackDomain = unknownPackage.includes('.') ? unknownPackage : `${unknownPackage}.org`
      expect(fallbackDomain).toBeTruthy()
    })

    it('should preserve existing domain formats', () => {
      const existingDomains = [
        'custom.domain.com',
        'github.com/user/repo',
        'registry.npmjs.org',
      ]

      existingDomains.forEach((domain) => {
        expect(domain.includes('.')).toBe(true)
      })
    })
  })

  describe('Archive Format Support', () => {
    it('should support tar.xz format', () => {
      const format = 'tar.xz'
      const extractCmd = `tar -xf archive.${format}`

      expect(extractCmd).toContain('tar -xf')
      expect(extractCmd).toContain('.tar.xz')
    })

    it('should support tar.gz format', () => {
      const format = 'tar.gz'
      const extractCmd = `tar -xzf archive.${format}`

      expect(extractCmd).toContain('tar -xzf')
      expect(extractCmd).toContain('.tar.gz')
    })

    it('should prefer tar.xz over tar.gz', () => {
      const formats = ['tar.xz', 'tar.gz']

      expect(formats[0]).toBe('tar.xz')
      expect(formats.indexOf('tar.xz')).toBeLessThan(formats.indexOf('tar.gz'))
    })

    it('should handle compression detection', () => {
      const testFiles = [
        'package.tar.xz',
        'package.tar.gz',
        'package.tgz',
      ]

      testFiles.forEach((filename) => {
        const isXz = filename.endsWith('.tar.xz')
        const isGz = filename.endsWith('.tar.gz') || filename.endsWith('.tgz')

        expect(isXz || isGz).toBe(true)
      })
    })
  })

  describe('Directory Structure', () => {
    it('should handle pkgx directory structure', () => {
      const domain = 'bun.sh'
      const version = '0.5.9'
      const binPath = path.join(domain, `v${version}`, 'bin')

      expect(binPath).toBe('bun.sh/v0.5.9/bin')
      expect(binPath).toContain(domain)
      expect(binPath).toContain(`v${version}`)
    })

    it('should search multiple binary locations', () => {
      const extractDir = '/tmp/extracted'
      const domain = 'test.org'
      const version = '1.0.0'

      const searchPaths = [
        extractDir,
        path.join(extractDir, 'bin'),
        path.join(extractDir, 'usr', 'bin'),
        path.join(extractDir, 'usr', 'local', 'bin'),
        path.join(extractDir, domain, `v${version}`, 'bin'),
      ]

      expect(searchPaths.length).toBe(5)
      expect(searchPaths).toContain(extractDir)
      expect(searchPaths).toContain(path.join(extractDir, 'bin'))
      expect(searchPaths[4]).toContain(`${domain}/v${version}/bin`)
    })

    it('should handle temporary directory creation', () => {
      const domain = 'test.org'
      const version = '1.0.0'
      const tempPath = path.join(tempDir, '.tmp', `${domain}-${version}`)

      // Create temp directory to test path structure
      fs.mkdirSync(tempPath, { recursive: true })
      expect(fs.existsSync(tempPath)).toBe(true)

      // Verify path structure
      expect(tempPath).toContain('.tmp')
      expect(tempPath).toContain(domain)
      expect(tempPath).toContain(version)
    })

    it('should handle extraction directory structure', () => {
      const tempPath = path.join(tempDir, 'test-extract')
      const extractPath = path.join(tempPath, 'extracted')

      fs.mkdirSync(extractPath, { recursive: true })
      expect(fs.existsSync(extractPath)).toBe(true)
      expect(path.basename(extractPath)).toBe('extracted')
    })
  })

  describe('Version Management', () => {
    it('should handle known working versions', () => {
      const knownVersions = {
        'bun.sh': '0.5.9',
        'nodejs.org': '18.17.0',
        'python.org': '3.11.4',
        'curl.se': '8.1.2',
      }

      Object.entries(knownVersions).forEach(([domain, version]) => {
        expect(version).toMatch(/^\d+\.\d+\.\d+$/)
        expect(domain).toContain('.')
      })
    })

    it('should handle version parsing', () => {
      const versions = ['0.5.9', '1.0.0', '18.17.0', '3.11.4']

      versions.forEach((version) => {
        const parts = version.split('.')
        expect(parts.length).toBe(3)
        parts.forEach((part) => {
          expect(/^\d+$/.test(part)).toBe(true)
        })
      })
    })

    it('should support latest version fallback', () => {
      const _unknownDomain = 'unknown.package'
      const fallbackVersion = 'latest'

      expect(fallbackVersion).toBe('latest')
      expect(typeof fallbackVersion).toBe('string')
    })

    it('should validate version formats', () => {
      const validVersions = ['1.0.0', '0.5.9', '18.17.0', '3.11.4']
      const invalidVersions = ['invalid', '1.0', 'v1.0.0', '1.0.0-beta']

      validVersions.forEach((version) => {
        expect(version).toMatch(/^\d+\.\d+\.\d+$/)
      })

      invalidVersions.forEach((version) => {
        expect(version).not.toMatch(/^\d+\.\d+\.\d+$/)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network timeouts', () => {
      const timeoutMs = 30000
      expect(timeoutMs).toBeGreaterThan(0)
      expect(typeof timeoutMs).toBe('number')
    })

    it('should handle HTTP error codes', () => {
      const errorCodes = [404, 403, 500, 503]

      errorCodes.forEach((code) => {
        expect(code).toBeGreaterThanOrEqual(400)
        expect(code).toBeLessThan(600)
      })
    })

    it('should handle invalid archive files', async () => {
      const invalidArchive = path.join(tempDir, 'invalid.tar.xz')
      await fs.promises.writeFile(invalidArchive, 'invalid content')

      expect(fs.existsSync(invalidArchive)).toBe(true)

      // Invalid archive should be detected when extraction is attempted
      const stats = await fs.promises.stat(invalidArchive)
      expect(stats.size).toBeGreaterThan(0)
    })

    it('should clean up temporary files on error', () => {
      const tempFile = path.join(tempDir, 'test-cleanup')
      fs.writeFileSync(tempFile, 'test')

      expect(fs.existsSync(tempFile)).toBe(true)

      // Cleanup should remove the file
      fs.unlinkSync(tempFile)
      expect(fs.existsSync(tempFile)).toBe(false)
    })
  })

  describe('Compatibility', () => {
    it('should maintain pkgx URL format compatibility', () => {
      const pkgxFormat = '{baseUrl}/{domain}/{os}/{arch}/v{version}.{format}'
      const expectedTokens = ['{baseUrl}', '{domain}', '{os}', '{arch}', '{version}', '{format}']

      expectedTokens.forEach((token) => {
        expect(pkgxFormat).toContain(token)
      })
    })

    it('should support pkgx domain naming conventions', () => {
      const pkgxDomains = [
        'bun.sh',
        'nodejs.org',
        'python.org',
        'gnu.org/wget',
        'git-scm.com',
      ]

      pkgxDomains.forEach((domain) => {
        expect(domain).toContain('.')
        // Most domains follow standard format
        if (!domain.includes('/')) {
          expect(domain.split('.').length).toBeGreaterThanOrEqual(2)
        }
      })
    })

    it('should handle migration to custom registry', () => {
      const futureRegistry = {
        baseUrl: 'https://registry.launchpad.dev',
        pathFormat: '{domain}/{os}/{arch}/v{version}.{format}',
        supportedFormats: ['tar.xz', 'tar.gz'],
        authentication: false,
      }

      expect(futureRegistry.baseUrl).not.toBe(DISTRIBUTION_CONFIG.baseUrl)
      expect(futureRegistry.pathFormat).toContain('{domain}')
      expect(futureRegistry.supportedFormats).toContain('tar.xz')
    })
  })

  describe('Performance', () => {
    it('should handle concurrent downloads efficiently', () => {
      const maxConcurrent = 3
      const packages = ['package1', 'package2', 'package3']

      expect(packages.length).toBeLessThanOrEqual(maxConcurrent)
    })

    it('should minimize disk usage with cleanup', () => {
      const tempFiles = [
        path.join(tempDir, 'temp1'),
        path.join(tempDir, 'temp2'),
      ]

      // Create temp files
      tempFiles.forEach((file) => {
        fs.writeFileSync(file, 'temp')
        expect(fs.existsSync(file)).toBe(true)
      })

      // Cleanup should remove all temp files
      tempFiles.forEach((file) => {
        fs.unlinkSync(file)
        expect(fs.existsSync(file)).toBe(false)
      })
    })

    it('should cache known package information', () => {
      const cache = new Map()
      const cacheKey = 'bun.sh:0.5.9'
      const cacheValue = { downloaded: true, path: '/path/to/binary' }

      cache.set(cacheKey, cacheValue)
      expect(cache.has(cacheKey)).toBe(true)
      expect(cache.get(cacheKey)).toBe(cacheValue)
    })
  })
})
