import { afterEach, describe, expect, it } from 'bun:test'
import { lstatSync, mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { detectPlatform, installPackage } from '../src/installer'

const scratch: string[] = []
afterEach(() => { for (const directory of scratch.splice(0)) rmSync(directory, { recursive: true, force: true }) })

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "pantry links ' "))
  scratch.push(root)
  const tree = join(root, 'pantry')
  const pkg = join(tree, 'wrapper.test/v1.0.0')
  mkdirSync(join(pkg, 'bin'), { recursive: true })
  mkdirSync(join(pkg, 'libexec'))
  // Like Git's published wrapper, the helper belongs to the package prefix.
  writeFileSync(join(pkg, 'bin/tool'), '#!/bin/sh\nprefix=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit\nexec "$prefix/libexec/tool" "$@"\n', { mode: 0o755 })
  writeFileSync(join(pkg, 'libexec/tool'), '#!/bin/sh\nprintf "%s\\n" "$LINK_FIXTURE" "$@"\nexit 7\n', { mode: 0o755 })
  return { root, tree, pkg }
}

function run(program: string) {
  const result = Bun.spawnSync([program, 'two words', "quote' $value; $(false)"], { env: { ...process.env, LINK_FIXTURE: 'inherited' } })
  expect(result.stderr.toString()).toBe('')
  expect(result.exitCode).toBe(7)
  expect(result.stdout.toString()).toBe("inherited\ntwo words\nquote' $value; $(false)\n")
}

describe.skipIf(process.platform === 'win32')('installed binary entrypoints', () => {
  it('executes package-relative wrappers through project and global entries, including after cache repair', async () => {
    const { root, tree, pkg } = fixture()
    const options = { installDir: tree, platform: detectPlatform(), globalBin: join(root, 'global bin'), quiet: true }
    for (let attempt = 0; attempt < 2; attempt++) {
      await installPackage('wrapper.test', '1.0.0', options)
      run(join(tree, '.bin/tool'))
      run(join(root, 'global bin/tool'))
      if (attempt === 0) for (const entry of [join(tree, '.bin/tool'), join(root, 'global bin/tool')]) {
        rmSync(entry)
        symlinkSync(join(pkg, 'bin/tool'), entry)
      }
    }
    expect(lstatSync(join(pkg, 'bin/tool')).isFile()).toBe(true)
  }, 15_000)

  it('keeps wrapper and binary entrypoints working when the environment moves', async () => {
    const { root, tree, pkg } = fixture()
    symlinkSync('/bin/echo', join(pkg, 'bin/native-echo'))
    await installPackage('wrapper.test', '1.0.0', { installDir: tree, platform: detectPlatform(), quiet: true })
    expect(lstatSync(join(tree, '.bin/native-echo')).isSymbolicLink()).toBe(true)
    const moved = `${root} moved`
    renameSync(root, moved)
    scratch.push(moved)
    run(join(moved, 'pantry/.bin/tool'))
    expect(realpathSync(join(moved, 'pantry/.bin/native-echo'))).toBe(realpathSync(join(moved, 'pantry/wrapper.test/v1.0.0/bin/native-echo')))
    const result = Bun.spawnSync([join(moved, 'pantry/.bin/native-echo'), 'works after moving'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout.toString()).toBe('works after moving\n')
  }, 15_000)

  it('resolves a shared environment through a directory alias', async () => {
    const { root, tree } = fixture()
    const alias = join(root, 'shared environment')
    symlinkSync(tree, alias)
    await installPackage('wrapper.test', '1.0.0', { installDir: alias, platform: detectPlatform(), quiet: true })
    run(join(tree, '.bin/tool'))
    rmSync(alias)
    run(join(tree, '.bin/tool'))
    const entryAlias = join(root, 'linked tool')
    symlinkSync(join(tree, '.bin/tool'), entryAlias)
    run(entryAlias)
  }, 15_000)
})
