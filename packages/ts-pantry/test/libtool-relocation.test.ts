import { expect, test } from 'bun:test'
import { copyFileSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { recipe } from '../src/recipes/gnu.org/libtool'

test('libtoolize finds its own installed data after relocation, including paths with spaces', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-libtool-relocation-'))
  try {
    const prefix = join(root, 'original')
    mkdirSync(join(prefix, 'bin'), { recursive: true })
    mkdirSync(join(prefix, 'share/libtool/build-aux'), { recursive: true })
    writeFileSync(join(prefix, 'share/libtool/build-aux/ltmain.sh'), 'fixture')
    // These quoted assignments occur inside func_init in upstream libtoolize.
    writeFileSync(join(root, 'libtoolize.in'), `#!/bin/sh
set -eu
func_init () {
  prefix="${prefix}"
  datadir="${prefix}/share"
  pkgauxdir="${prefix}/share/libtool/build-aux"
}
func_init
test -d "$pkgauxdir"
my_dir=$pkgauxdir
test -n "\`{ cd $my_dir && ls; } 2>/dev/null\`"
printf '%s\\n' "$prefix"
`)
    const commands = recipe.build!.script as string[]
    for (const command of commands.filter(command => command.endsWith('libtoolize.in'))) {
      const prepared = Bun.spawnSync(['bash', '-eu', '-c', command], { cwd: root })
      expect(prepared.exitCode).toBe(0)
    }
    copyFileSync(join(root, 'libtoolize.in'), join(prefix, 'bin/libtoolize'))
    const first = commands.indexOf('cd {{prefix}}/bin')
    const last = commands.indexOf('rm libtoolize.bak')
    expect(first).toBeGreaterThanOrEqual(0)
    expect(last).toBeGreaterThan(first)
    const transform = commands.slice(first, last + 1).join('\n').replaceAll('{{prefix}}', prefix)
    const built = Bun.spawnSync(['bash', '-eu', '-c', transform])
    expect(built.exitCode).toBe(0)
    const moved = join(root, 'relocated tools')
    renameSync(prefix, moved)
    const result = Bun.spawnSync(['sh', join(moved, 'bin/libtoolize')], { env: { PATH: process.env.PATH! } })
    expect(result.stderr.toString()).toBe('')
    expect(result.exitCode).toBe(0)
    expect(result.stdout.toString().trim()).toBe(moved)
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
