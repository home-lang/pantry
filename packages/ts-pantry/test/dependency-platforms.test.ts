import { expect, test } from 'bun:test'
import { cpSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { dependencyPlatform, recipeDepsToSpecs } from '../src/dependency-spec'
import { resolveTransitiveDependencies } from '../src/dependency-resolver'
import { generateZigDefinitions } from '../src/generate-zig'

test('recipe serialization preserves architecture groups and exact constraints', () => {
  expect(recipeDepsToSpecs({ 'zlib.net': 1, 'darwin/x86-64': { 'libisl.sourceforge.io': '^0' }, linux: { 'openssl.org': '3.2' } })).toEqual([
    'zlib.net@1', 'darwin/x86-64:libisl.sourceforge.io^0', 'linux:openssl.org@3.2',
  ])
  expect(recipeDepsToSpecs({ 'darwin/x86-64': null })).toEqual([])
  expect(() => recipeDepsToSpecs({ darwin: 'not a dependency map' })).toThrow()
  const cyclic: Record<string, unknown> = {}
  cyclic.linux = cyclic
  expect(() => recipeDepsToSpecs(cyclic)).toThrow()
  expect(dependencyPlatform('darwin/aarch64')).toEqual({ os: 'darwin', arch: 'arm64' })
  expect(dependencyPlatform('libisl.sourceforge.io')).toBeUndefined()
})

test('the generated GCC closure selects the requested OS and architecture', async () => {
  const deps = (targetOs: 'linux' | 'darwin', targetArch: string) => resolveTransitiveDependencies('gnu.org/gcc/libstdcxx', { targetOs, targetArch, maxDepth: 0 })
  const linux = await deps('linux', 'x64')
  const arm = await deps('darwin', 'arm64')
  const intel = await deps('darwin', 'x86-64')
  expect(linux.some(dep => dep.name === 'libisl.sourceforge.io' || dep.name.startsWith('darwin/'))).toBe(false)
  expect(arm.some(dep => dep.name === 'libisl.sourceforge.io')).toBe(false)
  expect(intel.find(dep => dep.name === 'libisl.sourceforge.io')).toMatchObject({ constraint: '^0', os: 'darwin', arch: 'x64' })
  expect(await deps('darwin', 'x64')).toEqual(intel)
})

test('native catalog generation preserves the same canonical architecture dependency', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pantry-platform-catalog-'))
  try {
    const source = path.resolve(import.meta.dir, '../src')
    for (const domain of ['gnu.org/gcc', 'gnu.org/gcc/libstdcxx', 'gnu.org/gcc/libgomp']) {
      for (const kind of ['packages', 'recipes']) {
        const destination = path.join(dir, kind, `${domain}.ts`)
        mkdirSync(path.dirname(destination), { recursive: true })
        cpSync(path.join(source, kind, `${domain}.ts`), destination)
      }
    }
    const output = path.join(dir, 'generated.zig')
    await generateZigDefinitions(path.join(dir, 'packages'), output)
    const text = await Bun.file(output).text()
    expect(text.match(/darwin\/x86-64:libisl\.sourceforge\.io\^0/g)).toHaveLength(3)
    expect(text).not.toContain('darwin/x86-64^')
  }
  finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
