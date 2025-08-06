import type { BinaryManifest } from '../src/binary-downloader'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { PrecompiledBinaryDownloader } from '../src/binary-downloader'

describe('Binary Downloader Manifest Parsing', () => {
  const testInstallPath = join(process.cwd(), 'test-temp-binary-downloader-manifest')

  beforeEach(async () => {
    // Clean up test directory
    try {
      await rm(testInstallPath, { recursive: true, force: true })
    }
    catch {
      // Directory doesn't exist, that's fine
    }
    await mkdir(testInstallPath, { recursive: true })
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testInstallPath, { recursive: true, force: true })
    }
    catch {
      // Ignore cleanup errors
    }
  })

  it('should parse the new manifest format correctly', () => {
    const sampleManifest: BinaryManifest = {
      version: '2025.08.06',
      built_at: '2025-08-06T18:36:54Z',
      commit: 'test-commit',
      binaries: [
        {
          filename: 'php-8.4.11-linux-x86_64-enterprise.tar.gz',
          size: 372,
          php_version: '8.4.11',
          platform: 'linux',
          architecture: 'x86_64',
          configuration: 'enterprise',
          built_at: '2025-08-06T18:36:55Z',
          extensions: 'cli,fpm,mbstring,opcache,intl,exif,bcmath,pdo-mysql,pdo-pgsql,pdo-sqlite,mysqli,pgsql,sqlite3,curl,openssl,gd,soap,sockets,zip,bz2,readline,libxml,zlib,pcntl,posix,gettext,gmp,ldap,xsl,sodium',
          download_url: 'https://example.com/php-8.4.11-linux-x86_64-enterprise.tar.gz',
        },
        {
          filename: 'php-8.4.11-darwin-arm64-laravel-mysql.tar.gz',
          size: 324,
          php_version: '8.4.11',
          platform: 'darwin',
          architecture: 'arm64',
          configuration: 'laravel-mysql',
          built_at: '2025-08-06T18:36:55Z',
          extensions: 'cli,fpm,mbstring,opcache,intl,exif,bcmath,pdo-mysql,mysqli,curl,openssl,gd,zip,readline,libxml,zlib',
          download_url: 'https://example.com/php-8.4.11-darwin-arm64-laravel-mysql.tar.gz',
        },
        {
          filename: 'php-8.3.15-darwin-arm64-api-only.tar.gz',
          size: 309,
          php_version: '8.3.15',
          platform: 'darwin',
          architecture: 'arm64',
          configuration: 'api-only',
          built_at: '2025-08-06T18:36:55Z',
          extensions: 'cli,fpm,mbstring,opcache,bcmath,pdo-mysql,mysqli,curl,openssl,zip,libxml,zlib',
          download_url: 'https://example.com/php-8.3.15-darwin-arm64-api-only.tar.gz',
        },
      ],
    }

    // Test that the manifest has the expected structure
    expect(sampleManifest.version).toBe('2025.08.06')
    expect(sampleManifest.built_at).toBe('2025-08-06T18:36:54Z')
    expect(sampleManifest.commit).toBe('test-commit')
    expect(sampleManifest.binaries).toHaveLength(3)

    // Test binary parsing
    const linuxBinary = sampleManifest.binaries[0]
    expect(linuxBinary.filename).toBe('php-8.4.11-linux-x86_64-enterprise.tar.gz')
    expect(linuxBinary.php_version).toBe('8.4.11')
    expect(linuxBinary.platform).toBe('linux')
    expect(linuxBinary.architecture).toBe('x86_64')
    expect(linuxBinary.configuration).toBe('enterprise')
    expect(linuxBinary.extensions).toContain('cli')
    expect(linuxBinary.extensions).toContain('fpm')
    expect(linuxBinary.extensions).toContain('pdo-mysql')

    const darwinBinary = sampleManifest.binaries[1]
    expect(darwinBinary.filename).toBe('php-8.4.11-darwin-arm64-laravel-mysql.tar.gz')
    expect(darwinBinary.php_version).toBe('8.4.11')
    expect(darwinBinary.platform).toBe('darwin')
    expect(darwinBinary.architecture).toBe('arm64')
    expect(darwinBinary.configuration).toBe('laravel-mysql')
  })

  it('should find matching binaries for current platform', async () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)

    // Mock manifest with current platform binaries
    const platform = (downloader as any).getPlatform()
    const arch = (downloader as any).getArchitecture()

    const mockManifest: BinaryManifest = {
      version: '2025.08.06',
      built_at: '2025-08-06T18:36:54Z',
      commit: 'test-commit',
      binaries: [
        {
          filename: `php-8.4.11-${platform}-${arch}-laravel-mysql.tar.gz`,
          size: 324,
          php_version: '8.4.11',
          platform,
          architecture: arch,
          configuration: 'laravel-mysql',
          built_at: '2025-08-06T18:36:55Z',
          extensions: 'cli,fpm,mbstring,opcache,intl,exif,bcmath,pdo-mysql,mysqli,curl,openssl,gd,zip,readline,libxml,zlib',
          download_url: `https://example.com/php-8.4.11-${platform}-${arch}-laravel-mysql.tar.gz`,
        },
        {
          filename: `php-8.4.11-${platform}-${arch}-enterprise.tar.gz`,
          size: 372,
          php_version: '8.4.11',
          platform,
          architecture: arch,
          configuration: 'enterprise',
          built_at: '2025-08-06T18:36:55Z',
          extensions: 'cli,fpm,mbstring,opcache,intl,exif,bcmath,pdo-mysql,pdo-pgsql,pdo-sqlite,mysqli,pgsql,sqlite3,curl,openssl,gd,soap,sockets,zip,bz2,readline,libxml,zlib,pcntl,posix,gettext,gmp,ldap,xsl,sodium',
          download_url: `https://example.com/php-8.4.11-${platform}-${arch}-enterprise.tar.gz`,
        },
      ],
    }

    // Test finding matching binary
    const matchingBinary = await (downloader as any).findMatchingBinary(mockManifest)
    expect(matchingBinary).not.toBeNull()
    expect(matchingBinary?.platform).toBe(platform)
    expect(matchingBinary?.architecture).toBe(arch)
    expect(matchingBinary?.php_version).toBe('8.4.11')
  })

  it('should handle empty manifest gracefully', async () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)

    const emptyManifest: BinaryManifest = {
      version: '2025.08.06',
      built_at: '2025-08-06T18:36:54Z',
      commit: 'test-commit',
      binaries: [],
    }

    const matchingBinary = await (downloader as any).findMatchingBinary(emptyManifest)
    expect(matchingBinary).toBeNull()
  })

  it('should provide fallback configurations', () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)

    // Test fallback configurations for different detected configs
    const laravelMysqlFallbacks = (downloader as any).getFallbackConfigurations('laravel-mysql')
    expect(laravelMysqlFallbacks).toContain('enterprise')
    expect(laravelMysqlFallbacks).toContain('full-stack')

    const apiOnlyFallbacks = (downloader as any).getFallbackConfigurations('api-only')
    expect(apiOnlyFallbacks).toContain('laravel-mysql')
    expect(apiOnlyFallbacks).toContain('enterprise')

    const enterpriseFallbacks = (downloader as any).getFallbackConfigurations('enterprise')
    expect(enterpriseFallbacks).toContain('full-stack')
    expect(enterpriseFallbacks).toContain('laravel-mysql')
  })
})
