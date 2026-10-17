import { afterEach, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { bundleRuntimeLibraries } from '../scripts/native-runtime'

const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'pantry library discovery '))
  roots.push(root)
  const artifact = join(root, 'artifact'), dependency = join(root, 'dependency')
  mkdirSync(join(artifact, 'bin'), { recursive: true })
  mkdirSync(join(dependency, 'lib/environment.d'), { recursive: true })
  return { root, artifact, dependency, packages: [{ domain: 'fixture.example', version: '1.0', prefix: dependency }] }
}

test('library discovery ignores an absent host configuration target in a dependency', () => {
  const { artifact, dependency, packages } = fixture()
  symlinkSync('../../etc/environment.d/99-environment.conf', join(dependency, 'lib/environment.d/99-environment.conf'))
  expect(bundleRuntimeLibraries(artifact, 'linux-x86-64', packages, () => false)).toEqual([])
})

test('a required library behind a broken dependency link still blocks publication', () => {
  const { root, artifact, dependency, packages } = fixture()
  writeFileSync(join(artifact, 'bin/application'), 'fixture executable')
  symlinkSync('missing-library.so.1', join(dependency, 'lib/librequired.so.1'))
  const inspector = join(root, 'patchelf')
  writeFileSync(inspector, '#!/bin/sh\n[ "$1" = --print-needed ] || exit 99\nprintf "librequired.so.1\\n"\n', { mode: 0o755 })
  expect(() => bundleRuntimeLibraries(artifact, 'linux-x86-64', packages, path => path.endsWith('/application'), inspector)).toThrow('Undeclared or missing runtime library librequired.so.1')
})

test('discovery never suppresses a cyclic dependency link', () => {
  const { artifact, dependency, packages } = fixture()
  symlinkSync('loop', join(dependency, 'lib/loop'))
  expect(() => bundleRuntimeLibraries(artifact, 'linux-x86-64', packages, () => false)).toThrow()
})


test('discovery preserves errors raised while inspecting a valid linked file', () => {
  const { artifact, dependency, packages } = fixture()
  writeFileSync(join(dependency, 'lib/target'), 'library fixture')
  symlinkSync('target', join(dependency, 'lib/linked'))
  expect(() => bundleRuntimeLibraries(artifact, 'linux-x86-64', packages, () => {
    throw Object.assign(new Error('classifier could not read its required input'), { code: 'ENOENT' })
  })).toThrow('classifier could not read its required input')
})
