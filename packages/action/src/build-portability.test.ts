import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { assertPortableActionBundle, azureCrc64SourceFilter, makeCrc64SourcePortable } from './build-portability'

describe('GitHub Action build portability', () => {
  test('selects the CRC64 source on Unix and native Windows loader paths', () => {
    for (const path of [
      '/home/runner/pantry/node_modules/@azure/storage-common/dist/esm/crc64.js',
      'D:/a/pantry/pantry/node_modules/@azure/storage-common/dist/esm/crc64.js',
      String.raw`D:\a\pantry\pantry\node_modules\@azure\storage-common\dist\esm\crc64.js`,
    ]) expect(azureCrc64SourceFilter.test(path)).toBe(true)
    for (const path of ['@azure/storage-common/dist/esm/crc64.js.map', '@azure/other/dist/esm/crc64.js'])
      expect(azureCrc64SourceFilter.test(path)).toBe(false)
  })

  test('rewrites Azure CRC64 module URLs to the runtime bundle location', () => {
    const source = 'import { fileURLToPath } from "node:url"; const require = createRequire(import.meta.url); const dir = fileURLToPath(import.meta.url)'
    const portable = makeCrc64SourcePortable(source)
    expect(portable).not.toContain('import.meta.url')
    expect(portable.match(/pathToFileURL\(process\.argv\[1\]\)/g)).toHaveLength(2)
  })

  test('rejects host paths and platform-specific file URLs', () => {
    expect(() => assertPortableActionBundle('const ok = true', '/workspace/pantry')).not.toThrow()
    expect(() => assertPortableActionBundle('const main = Bun.main === "/workspace/pantry/src/fetch.ts"', '/workspace/pantry')).toThrow('build-host workspace path')
    expect(() => assertPortableActionBundle(String.raw`const main = "D:\\a\\pantry\\src\\fetch.ts"`, String.raw`D:\a\pantry`)).toThrow('build-host workspace path')
    expect(() => assertPortableActionBundle('const p = "file:///workspace/pantry/node_modules"', '/workspace/pantry')).toThrow('build-host file URL')
    expect(() => assertPortableActionBundle('const p = "file:///Users/chris/repo"', '/workspace/pantry')).toThrow('macOS build-time file URL')
    expect(() => assertPortableActionBundle('const p = "file:///D:/a/repo"', '/workspace/pantry')).toThrow('Windows build-time file URL')
  })

  test('ships release asset publication retries in the committed bundle', () => {
    const bundle = readFileSync(new URL('../dist/index.js', import.meta.url), 'utf8')
    expect(bundle).toContain('remained unavailable after')
    expect(bundle).toContain('Incomplete download for')
    expect(bundle).toContain('Checksum mismatch for')
    expect(bundle).toContain('App Store delivery complete')
    expect(bundle).toContain('Object storage mirror')
    expect(bundle).toContain('release-manifest.json')
  })

  test('does not reinstall action-managed Zig dependencies in workflows', () => {
    for (const path of [
      '../../../.github/workflows/build-zig.yml',
      '../../../.github/workflows/release.yml',
    ]) {
      const workflow = readFileSync(new URL(path, import.meta.url), 'utf8')
      expect(workflow).toContain('uses: ./packages/action')
      expect(workflow).not.toContain('run: pantry install --no-save')
    }
  })
})
