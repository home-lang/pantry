import { afterEach, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { nativeActivationPrelude, resolveNativeExecutable } from './native-executable'

const fixtures: string[] = []
afterEach(() => fixtures.splice(0).forEach(root => rmSync(root, { recursive: true, force: true })))

function fixture(): { root: string, bin: string, executable: string } {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'pantry activation contract ')))
  fixtures.push(root)
  const bin = join(root, 'pantry', '.bin')
  const executable = join(root, 'pantry', 'example.org', 'v1.2.3', 'bin', 'probe')
  mkdirSync(bin, { recursive: true })
  mkdirSync(dirname(executable), { recursive: true })
  writeFileSync(executable, 'native executable fixture\n', { mode: 0o755 })
  return { root, bin, executable }
}

test('the Action and native CLI use the same exact activation prelude', () => {
  const source = readFileSync(join(import.meta.dir, '../../zig/src/install/symlink.zig'), 'utf8')
  const declaration = source.split('const shim_locate_self =\n')[1]?.split('\n;')[0]
  expect(declaration).toBeDefined()
  const prelude = declaration!.split('\n').map(line => line.slice(line.indexOf('\\\\') + 2)).join('\n')
  expect(prelude).toBe(nativeActivationPrelude)
  expect(source).toContain('pub fn resolvedActivationTarget(')
})

test('follows old links, native forwarders and aliases without executing them', () => {
  const { bin, executable } = fixture()
  const link = join(bin, 'old-link')
  symlinkSync(relative(bin, executable), link)
  expect(resolveNativeExecutable(link)).toBe(executable)
  const forwarder = join(bin, 'probe')
  writeFileSync(forwarder, `#!/bin/sh\n${nativeActivationPrelude}exec "$d/${relative(bin, executable)}" "$@"\n`, { mode: 0o755 })
  expect(resolveNativeExecutable(forwarder)).toBe(executable)
  const alias = join(bin, 'alias')
  symlinkSync('probe', alias)
  expect(resolveNativeExecutable(alias)).toBe(executable)
  writeFileSync(forwarder, `#!/bin/sh\nexec "${executable}" "$@"\n`, { mode: 0o755 })
  expect(resolveNativeExecutable(alias)).toBe(executable)
})

test('relative activation still resolves after the whole Pantry tree moves', () => {
  const { root, bin, executable } = fixture()
  writeFileSync(join(bin, 'probe'), `#!/bin/sh\n${nativeActivationPrelude}exec "$d/${relative(bin, executable)}" "$@"\n`, { mode: 0o755 })
  renameSync(join(root, 'pantry'), join(root, 'relocated pantry'))
  expect(resolveNativeExecutable(join(root, 'relocated pantry', '.bin', 'probe'))).toBe(join(root, 'relocated pantry', 'example.org', 'v1.2.3', 'bin', 'probe'))
})

test('retains physical package scripts and rejects corrupt activation targets and cycles', () => {
  const { bin, executable } = fixture()
  writeFileSync(executable, '#!/bin/sh\nexec "$JAVA_HOME/bin/java" -jar app.jar "$@"\n')
  expect(resolveNativeExecutable(executable)).toBe(executable)
  const forwarder = join(bin, 'probe')
  writeFileSync(forwarder, `#!/bin/sh\n${nativeActivationPrelude}exec "$d/../$(touch should-never-exist)" "$@"\n`)
  expect(() => resolveNativeExecutable(forwarder)).toThrow('Invalid Pantry executable activation target')
  writeFileSync(forwarder, `#!/bin/sh\n${nativeActivationPrelude}exec "$d/probe" "$@"\n`)
  expect(() => resolveNativeExecutable(forwarder)).toThrow('Cyclic Pantry executable activation')
})

test('preserves the real target for later managed-root ownership checks', () => {
  const { root, bin } = fixture()
  const outside = join(root, 'ambient-java')
  writeFileSync(outside, 'ambient executable fixture')
  writeFileSync(join(bin, 'java'), `#!/bin/sh\nexec "${outside}" "$@"\n`)
  expect(resolveNativeExecutable(join(bin, 'java'))).toBe(outside)
})
