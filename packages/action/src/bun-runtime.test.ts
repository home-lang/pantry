import { afterEach, describe, expect, test } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { setupBunRuntime } from './bun-runtime'

const dirs: string[] = []
function tempBinDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-action-bun-'))
  dirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

describe('setup-only (install: false) Bun runtime', () => {
  test('a rejected Bun install fails the setup and keeps the download error', async () => {
    const binDir = tempBinDir()
    let linked = false
    await expect(setupBunRuntime({
      binDir,
      install: async () => {
        throw new Error('Download failed after 4 attempts: HTTP 504 Gateway Timeout')
      },
      onLinked: () => { linked = true },
    })).rejects.toThrow('Required runtime bun.sh failed to install: Download failed after 4 attempts: HTTP 504 Gateway Timeout')
    expect(linked).toBe(false)
    expect(fs.existsSync(path.join(binDir, 'bunx'))).toBe(false)
  })

  test('a successful install preserves the provider bunx activation and exports the runtime', async () => {
    const binDir = tempBinDir()
    let linked = false
    await setupBunRuntime({
      binDir,
      install: async () => {
        fs.writeFileSync(path.join(binDir, 'bun'), '#!/bin/sh\n', { mode: 0o755 })
        fs.writeFileSync(path.join(binDir, 'bunx'), '#!/bin/sh\nexec "$(dirname "$0")/bun" x "$@"\n', { mode: 0o755 })
      },
      onLinked: () => { linked = true },
    })
    expect(linked).toBe(true)
    expect(fs.lstatSync(path.join(binDir, 'bunx')).isSymbolicLink()).toBe(false)
    expect(fs.readFileSync(path.join(binDir, 'bunx'), 'utf8')).toContain('/bun" x "$@"')
  })

  test.skipIf(process.platform === 'win32')('executor arguments survive a primary runtime launcher', async () => {
    const binDir = tempBinDir()
    const activation = '#!/bin/sh\nexec "$(dirname "$0")/bun" x "$@"\n'
    await setupBunRuntime({
      binDir,
      install: async () => {
        fs.writeFileSync(path.join(binDir, 'bun'), '#!/bin/sh\nprintf "%s\\n" "$@"\n', { mode: 0o755 })
        fs.writeFileSync(path.join(binDir, 'bunx'), activation, { mode: 0o755 })
      },
    })
    const result = Bun.spawnSync([path.join(binDir, 'bunx'), '--bun', '@stacksjs/buddy@0.75.283', '--version'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout.toString().trim().split('\n')).toEqual(['x', '--bun', '@stacksjs/buddy@0.75.283', '--version'])
    expect(fs.readFileSync(path.join(binDir, 'bunx'), 'utf8')).toBe(activation)
  })
})
