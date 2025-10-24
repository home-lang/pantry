import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createShims } from '../src/install-helpers'

/**
 * Tests for Bun shim creation: ensure bunx is a proper shim that runs `bun x`.
 */
describe('Bun shim creation', () => {
  let tempDir: string
  let installPath: string
  let packageDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-bun-shim-'))
    installPath = tempDir // install-helpers writes shims to installPath/bin

    // Create fake bun package layout: <installPath>/bun.sh/v1.2.3/bin/bun
    const domainDir = path.join(tempDir, 'bun.sh')
    packageDir = path.join(domainDir, 'v1.2.3')
    const binDir = path.join(packageDir, 'bin')
    fs.mkdirSync(binDir, { recursive: true })

    const bunBinaryPath = path.join(binDir, 'bun')
    // Create a minimal executable stub to act as bun binary
    fs.writeFileSync(
      bunBinaryPath,
      '#!/bin/sh\necho "fake bun"\n',
      { mode: 0o755 },
    )
  })

  afterEach(() => {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    }
    catch {
      // ignore cleanup errors
    }
  })

  it('creates bun and bunx shims with correct behavior and env', async () => {
    const domain = 'bun.sh'
    const version = '1.2.3'

    const created = await createShims(packageDir, installPath, domain, version)

    // Expect bun and bunx reported
    expect(created).toContain('bun')
    expect(created).toContain('bunx')

    const shimDir = path.join(installPath, 'bin')
    const bunShim = path.join(shimDir, 'bun')
    const bunxShim = path.join(shimDir, 'bunx')

    // Files exist and are executable
    expect(fs.existsSync(bunShim)).toBe(true)
    expect(fs.existsSync(bunxShim)).toBe(true)

    const bunMode = fs.statSync(bunShim).mode & 0o111
    const bunxMode = fs.statSync(bunxShim).mode & 0o111
    expect(bunMode).not.toBe(0)
    expect(bunxMode).not.toBe(0)

    const bunShimContent = fs.readFileSync(bunShim, 'utf8')
    const bunxShimContent = fs.readFileSync(bunxShim, 'utf8')

    // bun shim should export BUN_INSTALL and exec the actual bun binary
    expect(bunShimContent).toContain('export BUN_INSTALL=')
    expect(bunShimContent).toContain('exec "')
    expect(bunShimContent).toContain('" "$@"')

    // bunx shim should export BUN_INSTALL and call bun with `x` subcommand
    expect(bunxShimContent).toContain('export BUN_INSTALL=')
    expect(bunxShimContent).toMatch(/exec\s+".*bun"\s+x\s+"\$@"/)

    // Ensure .bun structure and symlinks are created
    const officialDir = path.join(installPath, '.bun')
    const officialBinDir = path.join(officialDir, 'bin')
    const officialBun = path.join(officialBinDir, 'bun')
    const officialBunx = path.join(officialBinDir, 'bunx')
    expect(fs.existsSync(officialDir)).toBe(true)
    expect(fs.existsSync(officialBinDir)).toBe(true)
    expect(fs.existsSync(officialBun)).toBe(true)
    expect(fs.existsSync(officialBunx)).toBe(true)

    // Optional: node symlink should exist pointing to bun (created only if absent)
    const nodeShim = path.join(shimDir, 'node')
    expect(fs.existsSync(nodeShim)).toBe(true)
  })
})
