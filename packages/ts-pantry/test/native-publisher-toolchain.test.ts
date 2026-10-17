import { describe, expect, test } from 'bun:test'
import { copyFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inspectManagedProgram, managedProgram } from '../scripts/native-publisher-toolchain'

describe('native publisher tool ownership', () => {
  test('executes its managed runtime and rejects host tools and escaping links', () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry-toolchain-'))
    try {
      const bin = join(root, 'pantry/.bin')
      const installed = join(root, 'pantry/runtime/bin')
      mkdirSync(bin, { recursive: true })
      mkdirSync(installed, { recursive: true })
      const runtime = join(installed, 'bun')
      copyFileSync(process.execPath, runtime)
      symlinkSync('../runtime/bin/bun', join(bin, 'bun'))
      expect(inspectManagedProgram(root, 'bun', join(bin, 'bun'))).toEqual({ name: 'bun', path: realpathSync(runtime), version: Bun.version })
      expect(inspectManagedProgram(root, 'bun', join(bin, 'bun'), Bun.version).version).toBe(Bun.version)
      expect(() => inspectManagedProgram(root, 'bun', join(bin, 'bun'), '99.0.0')).toThrow('expected 99.0.0')
      expect(() => managedProgram(root, 'bun', process.execPath)).toThrow('PATH did not select')
      expect(() => managedProgram(root, 'bun', null)).toThrow('PATH did not select')
      symlinkSync(process.execPath, join(bin, 'escaped'))
      expect(() => managedProgram(root, 'escaped', join(bin, 'escaped'))).toThrow('outside the Pantry installation')
    }
    finally { rmSync(root, { recursive: true, force: true }) }
  })
})
