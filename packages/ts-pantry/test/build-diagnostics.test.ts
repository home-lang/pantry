import { expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { persistBuildDiagnostics, sanitizeBuildDiagnostic } from '../scripts/build-diagnostics'

test('build diagnostics preserve configure failures and redact credentials without following symlinks', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-diagnostics-'))
  try {
    const build = join(root, 'source')
    mkdirSync(build)
    writeFileSync(join(build, 'config.log'), 'loader: missing libexample.so.1\ncredential=private-token-value\nhttps://user:password@example.org/source')
    writeFileSync(join(root, 'outside'), 'must-not-copy')
    mkdirSync(join(build, 'nested'))
    symlinkSync(join(root, 'outside'), join(build, 'nested/config.log'))
    const output = persistBuildDiagnostics({ buildDir: build, runnerTemp: root, script: 'export TOKEN=private-token-value', error: new Error('failed private-token-value'), environment: { NPM_TOKEN: 'private-token-value' } })!
    const files = readdirSync(output).sort()
    expect(files).toEqual(['build-script.sh.txt', 'config-1.log', 'failure.txt'])
    const text = files.map(file => readFileSync(join(output, file), 'utf8')).join('\n')
    expect(text).toContain('missing libexample.so.1')
    expect(text).toContain('[REDACTED]')
    expect(text).not.toContain('private-token-value')
    expect(text).not.toContain('user:password')
    expect(text).not.toContain('must-not-copy')
    expect(persistBuildDiagnostics({ buildDir: build, script: '', error: '' })).toBeUndefined()
    expect(sanitizeBuildDiagnostic('encoded=a%2Fb', { API_KEY: 'a/b' })).toBe('encoded=[REDACTED]')
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('diagnostics bound oversized logs and refuse a redirected output directory', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-diagnostics-bounds-'))
  try {
    const build = join(root, 'source')
    mkdirSync(build)
    writeFileSync(join(build, 'config.log'), 'x'.repeat(5 * 1024 * 1024))
    const output = persistBuildDiagnostics({ buildDir: build, runnerTemp: root, script: '', error: '', environment: {} })!
    const log = readFileSync(join(output, 'config-1.log'), 'utf8')
    expect(log.length).toBeLessThan(4 * 1024 * 1024 + 100)
    expect(log).toContain('[diagnostic truncated at 4 MiB]')
    const redirected = join(root, 'redirected')
    mkdirSync(redirected)
    symlinkSync(build, join(redirected, 'pantry-build-diagnostics'))
    expect(() => persistBuildDiagnostics({ buildDir: build, runnerTemp: redirected, script: '', error: '' })).toThrow('real directory')
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
