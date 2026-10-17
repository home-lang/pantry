import { expect, test } from 'bun:test'
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { verifyDeclaredPrograms } from '../scripts/declared-programs'

test('publication requires every concrete advertised executable, not just a working primary binary', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-declared-programs-'))
  try {
    mkdirSync(join(root, 'bin'))
    copyFileSync(process.execPath, join(root, 'bin', 'primary'))
    expect(() => verifyDeclaredPrograms(root, 'example.org', ['primary', 'missing-helper'])).toThrow('declared program missing-helper')
    writeFileSync(join(root, 'bin', 'missing-helper'), '')
    expect(() => verifyDeclaredPrograms(root, 'example.org', ['primary', 'missing-helper'])).toThrow('declared program missing-helper')
    copyFileSync(process.execPath, join(root, 'bin', 'missing-helper'))
    expect(() => verifyDeclaredPrograms(root, 'example.org', ['primary', 'missing-helper'])).not.toThrow()
    if (process.platform !== 'win32') {
      chmodSync(join(root, 'bin', 'missing-helper'), 0o600)
      expect(() => verifyDeclaredPrograms(root, 'example.org', ['primary', 'missing-helper'])).toThrow('non-executable')
    }
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('publication accepts owned helper links and sbin programs but rejects a host executable', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-declared-links-'))
  try {
    mkdirSync(join(root, 'libexec'))
    mkdirSync(join(root, 'bin'))
    mkdirSync(join(root, 'sbin'))
    copyFileSync(process.execPath, join(root, 'libexec', 'runtime'))
    copyFileSync(process.execPath, join(root, 'sbin', 'server'))
    symlinkSync('../libexec/runtime', join(root, 'bin', 'client'))
    expect(() => verifyDeclaredPrograms(root, 'example.org', ['client', 'server'])).not.toThrow()
    symlinkSync(process.execPath, join(root, 'bin', 'host'))
    expect(() => verifyDeclaredPrograms(root, 'example.org', ['host'])).toThrow('outside its package prefix')
    expect(() => verifyDeclaredPrograms(root, 'example.org', ['../host'])).toThrow('invalid declared program')
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
