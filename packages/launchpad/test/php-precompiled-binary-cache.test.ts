import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import * as fs from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import { PrecompiledBinaryDownloader } from '../src/binary-downloader'

describe('Precompiled PHP binary caching', () => {
  const testInstallPath = path.join(process.cwd(), 'test-temp-precompiled-cache')
  const binaryFilename = 'php-8.3.0-full-stack-darwin-arm64.tar.gz'
  const cachedPath = path.join(testInstallPath, '.cache', 'precompiled-binaries', binaryFilename)

  let originalFetch: typeof fetch
  let fetchCalls = 0

  beforeEach(async () => {
    try {
      await rm(testInstallPath, { recursive: true, force: true })
    }
    catch {}
    await mkdir(testInstallPath, { recursive: true })

    originalFetch = globalThis.fetch
    fetchCalls = 0
    // Generic fetch mock; we'll only rely on it for the tarball download
    globalThis.fetch = (async (..._args: any[]) => {
      fetchCalls++
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: () => null },
        // Body presence is checked, but we take the unknown-size branch which uses arrayBuffer
        body: {},
        arrayBuffer: async () => new ArrayBuffer(16),
      } as any
    }) as unknown as typeof fetch
    ;(globalThis.fetch as any).preconnect = () => {}
  })

  afterEach(async () => {
    globalThis.fetch = originalFetch
    try {
      await rm(testInstallPath, { recursive: true, force: true })
    }
    catch {}
  })

  it('reuses cached tarball on subsequent installs (no second network fetch)', async () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)

    // Force a deterministic environment for matching the manifest binary
    ;(downloader as any).getPlatform = () => 'darwin'
    ;(downloader as any).getArchitecture = () => 'arm64'
    ;(downloader as any).detectFrameworkAndDatabase = async () => 'full-stack'

    // Provide a fake manifest so no network is needed for manifest retrieval
    ;(downloader as any).downloadManifest = async () => ({
      version: '1',
      built_at: new Date().toISOString(),
      commit: 'deadbeef',
      binaries: [
        {
          filename: binaryFilename,
          size: 1024,
          php_version: '8.3.0',
          platform: 'darwin',
          architecture: 'arm64',
          configuration: 'full-stack',
          built_at: new Date().toISOString(),
          extensions: 'cli,fpm',
          download_url: 'https://example.com/php-8.3.0.tar.gz',
        },
      ],
    })

    // Avoid running real tar extraction; simulate extraction success
    ;(downloader as any).extractBinary = async (_binaryPath: string, binary: any) => {
      const packageDir = path.join(testInstallPath, 'php.net', `v${binary.php_version}`)
      await rm(packageDir, { recursive: true, force: true }).catch(() => {})
      await mkdir(path.join(packageDir, 'bin'), { recursive: true })
      await writeFile(path.join(packageDir, 'bin', 'php'), '#!/bin/sh\necho php')
      fs.chmodSync(path.join(packageDir, 'bin', 'php'), 0o755)
      return packageDir
    }

    // 1st install: should download and cache the tarball
    const first = await downloader.downloadAndInstallPHP()
    expect(first.success).toBe(true)
    expect(fs.existsSync(cachedPath)).toBe(true)
    expect(fetchCalls).toBe(1)

    // Remove the installed package dir to force re-installation (but keep cache)
    const installedDir = path.join(testInstallPath, 'php.net', 'v8.3.0')
    await rm(installedDir, { recursive: true, force: true }).catch(() => {})
    expect(fs.existsSync(cachedPath)).toBe(true)

    // 2nd install: should reuse cache; no additional fetch call
    const second = await downloader.downloadAndInstallPHP()
    expect(second.success).toBe(true)
    expect(fetchCalls).toBe(1)
  })
})
