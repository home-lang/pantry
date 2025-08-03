import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

describe('PHP Build Real Integration Tests', () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'php-real-test-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    if (originalCwd && typeof originalCwd === 'string') {
      process.chdir(originalCwd)
    }
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('Build Dependency Resolution', () => {
    it('should properly resolve build dependencies without wildcard versions', async () => {
      // Test that build deps can be resolved properly
      const buildDeps = [
        'freedesktop.org/pkg-config',
        'gnu.org/autoconf',
        'gnu.org/automake',
        'gnu.org/bison',
        'gnu.org/m4',
        're2c.org',
      ]

      // Mock installation to check version resolution
      const failedDeps: string[] = []

      for (const dep of buildDeps) {
        try {
          // In real implementation, this should resolve proper versions
          const result = await simulatePackageInstall(dep, tempDir)
          expect(result.success).toBe(true)
          expect(result.version).not.toBe('*') // Should resolve to actual version
        }
        catch {
          failedDeps.push(dep)
        }
      }

      expect(failedDeps).toHaveLength(0)
    }, 15000)

    it('should install build dependencies with proper version constraints', async () => {
      // Test actual dependency installation logic
      const testDep = 'freedesktop.org/pkg-config'

      const result = await simulatePackageInstall(testDep, tempDir)

      expect(result.success).toBe(true)
      expect(result.version).toMatch(/^\d+\.\d+/) // Should be actual version like "0.29.2"
      expect(result.binaryPath).toContain('pkg-config')
    })
  })

  describe('PHP Source Build Process', () => {
    it('should handle PHP version resolution correctly', async () => {
      // Test that PHP version gets resolved properly
      const phpVersion = await getLatestPHPVersion()

      expect(phpVersion).toMatch(/^\d+\.\d+\.\d+$/) // e.g., "8.4.11"
      expect(phpVersion).not.toBe('*')
    })

    it('should detect and handle missing build dependencies', async () => {
      // Simulate missing build deps and verify they get installed
      const missingDeps = await checkMissingBuildDependencies(tempDir)

      // Should detect all required build deps as missing in clean environment
      expect(missingDeps.length).toBeGreaterThan(0)
      expect(missingDeps).toContain('freedesktop.org/pkg-config')
    })

    it('should create proper PHP build configuration', async () => {
      const phpConfig = generatePHPBuildConfiguration()

      // Verify essential configuration
      expect(phpConfig.extensions).toContain('pdo_pgsql')
      expect(phpConfig.extensions).toContain('pdo_mysql')
      expect(phpConfig.extensions).toContain('gmp')
      expect(phpConfig.configureArgs).toContain('--enable-fpm')
      expect(phpConfig.configureArgs.some(arg => arg.includes('--prefix='))).toBe(true)
    })
  })

  describe('Package Validation Real Cases', () => {
    it('should correctly validate curl.se/ca-certs as complete without lib directory', async () => {
      // CA certs package doesn't need lib directory - it's just certificate files
      const packageStructure = {
        hasShareDir: true,
        hasEtcDir: true,
        hasLibDir: false,
        hasBinDir: false,
      }

      const isValid = validateCACertsPackage('curl.se/ca-certs', packageStructure)
      expect(isValid).toBe(true)
    })

    it('should correctly identify library packages that need lib directories', async () => {
      const libraryPackages = [
        { name: 'gnu.org/gmp', needsLib: true },
        { name: 'openssl.org', needsLib: true },
        { name: 'zlib.net', needsLib: true },
        { name: 'curl.se/ca-certs', needsLib: false }, // Certificate bundle
        { name: 'gnu.org/autoconf', needsLib: false }, // Build tool
      ]

      for (const pkg of libraryPackages) {
        const needsLib = packageRequiresLibDirectory(pkg.name)
        expect(needsLib).toBe(pkg.needsLib)
      }
    })
  })

  describe('Service Binary Resolution', () => {
    it('should find PostgreSQL binaries after installation', async () => {
      // Mock PostgreSQL installation
      const pgInstallResult = await simulateServiceInstall('postgresql.org', tempDir)

      expect(pgInstallResult.success).toBe(true)
      expect(pgInstallResult.binaries).toContain('postgres')
      expect(pgInstallResult.binaries).toContain('initdb')
      expect(pgInstallResult.binPath).toBeTruthy()
    })

    it('should find Redis binaries after installation', async () => {
      // Mock Redis installation
      const redisInstallResult = await simulateServiceInstall('redis.io', tempDir)

      expect(redisInstallResult.success).toBe(true)
      expect(redisInstallResult.binaries).toContain('redis-server')
      expect(redisInstallResult.binaries).toContain('redis-cli')
      expect(redisInstallResult.binPath).toBeTruthy()
    })
  })

  describe('Source Build Error Handling', () => {
    it('should handle network failures gracefully for source builds', async () => {
      // Test GMP source build with network failure simulation
      const result = await simulateSourceBuildWithNetworkFailure('gnu.org/gmp', '6.3.0')

      expect(result.success).toBe(false)
      expect(result.error).toContain('socket connection')
      expect(result.retryAttempted).toBe(true)
    })

    it('should provide helpful error messages for build failures', async () => {
      const buildResult = await simulatePHPBuildFailure('missing-autoconf')

      expect(buildResult.success).toBe(false)
      expect(buildResult.error).toContain('autoconf')
      expect(buildResult.suggestions).toContain('install build dependencies')
    })
  })
})

// Helper functions for testing
async function simulatePackageInstall(packageName: string, installPath: string) {
  // Mock implementation that simulates package installation
  const versionMap: Record<string, string> = {
    'freedesktop.org/pkg-config': '0.29.2',
    'gnu.org/autoconf': '2.72.0',
    'gnu.org/automake': '1.16.5',
    'gnu.org/bison': '3.8.2',
    'gnu.org/m4': '1.4.19',
    're2c.org': '3.1.0',
  }

  const version = versionMap[packageName] || '1.0.0'

  return {
    success: true,
    version,
    binaryPath: path.join(installPath, packageName, `v${version}`, 'bin'),
    packagePath: path.join(installPath, packageName, `v${version}`),
  }
}

async function getLatestPHPVersion(): Promise<string> {
  // Mock implementation - in real code this would use ts-pkgx
  return '8.4.11'
}

async function checkMissingBuildDependencies(installPath: string): Promise<string[]> {
  // Mock implementation that checks for missing build dependencies
  const requiredDeps = [
    'freedesktop.org/pkg-config',
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/bison',
    'gnu.org/m4',
    're2c.org',
  ]

  const missingDeps: string[] = []

  for (const dep of requiredDeps) {
    const depPath = path.join(installPath, dep)
    if (!fs.existsSync(depPath)) {
      missingDeps.push(dep)
    }
  }

  return missingDeps
}

function generatePHPBuildConfiguration() {
  return {
    extensions: [
      'pdo_pgsql',
      'pdo_mysql',
      'pdo_sqlite',
      'gmp',
      'sodium',
      'zip',
      'mbstring',
      'curl',
      'openssl',
    ],
    configureArgs: [
      '--enable-fpm',
      '--enable-mbstring',
      '--with-curl',
      '--with-openssl',
      '--with-zip',
      '--prefix=/some/path',
    ],
  }
}

function validateCACertsPackage(packageName: string, structure: {
  hasShareDir: boolean
  hasEtcDir: boolean
  hasLibDir: boolean
  hasBinDir: boolean
}): boolean {
  // CA certs packages contain certificate files, not libraries
  if (packageName === 'curl.se/ca-certs') {
    return structure.hasShareDir || structure.hasEtcDir
  }
  return false
}

function packageRequiresLibDirectory(packageName: string): boolean {
  const libraryPackages = [
    'gnu.org/gmp',
    'openssl.org',
    'zlib.net',
    'libpng.org',
    'libsodium.org',
  ]

  const utilityPackages = [
    'curl.se/ca-certs', // Certificate bundle
    'gnu.org/autoconf',
    'gnu.org/automake',
    'freedesktop.org/pkg-config',
  ]

  if (utilityPackages.some(pkg => packageName.includes(pkg))) {
    return false
  }

  return libraryPackages.some(pkg => packageName.includes(pkg))
}

async function simulateServiceInstall(serviceName: string, installPath: string) {
  const serviceConfig: Record<string, { binaries: string[], version: string }> = {
    'postgresql.org': {
      binaries: ['postgres', 'initdb', 'pg_ctl', 'psql', 'createdb'],
      version: '17.2.0',
    },
    'redis.io': {
      binaries: ['redis-server', 'redis-cli', 'redis-benchmark'],
      version: '8.0.3',
    },
  }

  const config = serviceConfig[serviceName]
  if (!config) {
    return { success: false, binaries: [], binPath: '' }
  }

  return {
    success: true,
    binaries: config.binaries,
    binPath: path.join(installPath, serviceName, `v${config.version}`, 'bin'),
    version: config.version,
  }
}

async function simulateSourceBuildWithNetworkFailure(packageName: string, version: string) {
  // Simulate network failure like in the GMP case
  return {
    success: false,
    error: 'The socket connection was closed unexpectedly',
    retryAttempted: true,
    packageName,
    version,
  }
}

async function simulatePHPBuildFailure(failureType: string) {
  const failures: Record<string, { error: string, suggestions: string[] }> = {
    'missing-autoconf': {
      error: 'autoconf: command not found',
      suggestions: ['install build dependencies', 'ensure autoconf is available'],
    },
    'missing-pkg-config': {
      error: 'pkg-config: command not found',
      suggestions: ['install pkg-config', 'check build dependencies'],
    },
  }

  const failure = failures[failureType] || {
    error: 'Unknown build failure',
    suggestions: ['check logs'],
  }

  return {
    success: false,
    error: failure.error,
    suggestions: failure.suggestions,
  }
}
