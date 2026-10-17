import { afterEach, expect, test } from 'bun:test'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { copyRuntimeResources } from '../scripts/native-runtime'
import { loadRecipe } from '../scripts/recipe-loader'

const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'pantry runtime resources '))
  roots.push(root)
  const owner = join(root, 'owner'), artifact = join(root, 'artifact')
  mkdirSync(join(owner, 'lib/tcl8.6'), { recursive: true })
  mkdirSync(artifact)
  writeFileSync(join(owner, 'lib/tcl8.6/init.tcl'), 'package provide Tcl 8.6.17\n')
  return { root, owner, artifact, dependency: { domain: 'tcl-lang.org', version: '8.6.17', prefix: owner, resources: ['lib/tcl8.6'] } }
}

test('declared library data survives relocation without its source package or environment overrides', () => {
  const { root, owner, artifact, dependency } = fixture()
  chmodSync(join(owner, 'lib/tcl8.6/init.tcl'), 0o444)
  symlinkSync('init.tcl', join(owner, 'lib/tcl8.6/alias.tcl'))
  const receipts = copyRuntimeResources(artifact, dependency)
  expect(receipts.map(entry => entry.path)).toEqual(['lib/tcl8.6/alias.tcl', 'lib/tcl8.6/init.tcl'])
  expect(receipts[0]!.sha256).toMatch(/^[a-f0-9]{64}$/)
  expect(copyRuntimeResources(artifact, dependency)).toEqual(receipts)
  const moved = join(root, 'fresh consumer')
  renameSync(artifact, moved)
  rmSync(owner, { recursive: true })
  expect(readFileSync(join(moved, 'lib/tcl8.6/alias.tcl'), 'utf8')).toContain('8.6.17')
  expect(statSync(join(moved, 'lib/tcl8.6/init.tcl')).mode & 0o777).toBe(0o444)
})

test('resource copying refuses traversal, escaping symlinks and directory cycles', () => {
  const { root, owner, artifact, dependency } = fixture()
  for (const path of ['../owner', '/etc', 'lib\\tcl8.6', 'lib/../owner', ''])
    expect(() => copyRuntimeResources(artifact, { ...dependency, resources: [path] })).toThrow('Invalid runtime resource path')
  const foreign = join(root, 'foreign')
  writeFileSync(foreign, 'foreign data')
  symlinkSync(foreign, join(owner, 'lib/tcl8.6/escape'))
  expect(() => copyRuntimeResources(artifact, dependency)).toThrow('escapes declared package')
  rmSync(join(owner, 'lib/tcl8.6/escape'))
  symlinkSync('.', join(owner, 'lib/tcl8.6/loop'))
  expect(() => copyRuntimeResources(artifact, dependency)).toThrow('Cyclic runtime resource')
})

test('resources never overwrite a product file or follow an artifact symlink', () => {
  const { root, artifact, dependency } = fixture()
  mkdirSync(join(artifact, 'lib/tcl8.6'), { recursive: true })
  writeFileSync(join(artifact, 'lib/tcl8.6/init.tcl'), 'owned product data')
  expect(() => copyRuntimeResources(artifact, dependency)).toThrow('Conflicting runtime resource')
  expect(readFileSync(join(artifact, 'lib/tcl8.6/init.tcl'), 'utf8')).toBe('owned product data')
  rmSync(join(artifact, 'lib'), { recursive: true })
  const foreign = join(root, 'foreign directory')
  mkdirSync(foreign)
  symlinkSync(foreign, join(artifact, 'lib'))
  expect(() => copyRuntimeResources(artifact, dependency)).toThrow('Unsafe runtime resource destination')
})

test('Tcl and Tk resources follow the exact recipe release series', async () => {
  for (const version of ['8.6.17', '9.0.3']) {
    const { recipe } = await loadRecipe('tcl-lang.org', 'linux-x86-64', version)
    const series = version.split('.').slice(0, 2).join('.')
    expect(recipe.runtimeResources).toEqual([`lib/tcl${series}`, `lib/tk${series}`])
  }
  const { artifact, dependency } = fixture()
  expect(() => copyRuntimeResources(artifact, { ...dependency, resources: ['lib/missing'] })).toThrow()
})
