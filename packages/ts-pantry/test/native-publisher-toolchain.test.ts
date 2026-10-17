import { describe, expect, test } from 'bun:test'
import { copyFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inspectManagedProgram, managedProgram, nativeBuildTools, reportedVersionMatches } from '../scripts/native-publisher-toolchain'

describe('native publisher tool ownership', () => {
  test('supplies the external xz decoder used by GNU tar on both native platforms', () => {
    for (const platform of ['linux', 'darwin'])
      expect(nativeBuildTools(platform)).toContainEqual({ package: 'tukaani.org/xz', version: '5.8.2', programs: ['xz'] })
  })
  test('reads GNU sed identity rather than digits in its absolute argv path', () => {
    const executable = '/Users/runner/work/pantry/pantry/pantry/gnu.org/sed/v4.10/bin/sed'
    expect(reportedVersionMatches(executable, `${executable} (GNU sed) 4.10`, '4.10')).toBe(true)
    expect(reportedVersionMatches(executable, `${executable} (GNU sed) 4.9`, '4.10')).toBe(false)
    expect(reportedVersionMatches('/managed/make', 'GNU Make 4.3', '4.3.0')).toBe(true)
  })
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
