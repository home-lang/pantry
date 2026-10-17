import { expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { recipe } from '../src/recipes/mesonbuild.com'

test('Meson uses its declared Python after relocation and refuses an available host fallback', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry meson runtime '))
  try {
    const tree = join(root, 'pantry')
    const prefix = join(tree, 'mesonbuild.com/v1.12.1')
    const python = join(tree, 'python.org/v3.12.13/bin')
    const host = join(root, 'host')
    for (const directory of [join(prefix, 'bin'), join(prefix, 'libexec/meson'), python, host, join(tree, '.bin')]) mkdirSync(directory, { recursive: true })
    writeFileSync(join(prefix, 'bin/meson'), readFileSync(new URL('../src/recipes/props/mesonbuild.com/meson', import.meta.url)), { mode: 0o755 })
    writeFileSync(join(prefix, 'libexec/meson/meson.py'), 'Meson entrypoint\n')
    writeFileSync(join(python, 'python3'), '#!/bin/sh\ncat "$1"\nshift\nprintf "%s\\n" "$@"\n', { mode: 0o755 })
    writeFileSync(join(host, 'python3'), '#!/bin/sh\necho unexpected-host\n', { mode: 0o755 })
    symlinkSync('../mesonbuild.com/v1.12.1/bin/meson', join(tree, '.bin/meson'))
    const run = (path: string) => Bun.spawnSync([path, 'argument with spaces'], { env: { ...process.env, PATH: `${host}:/usr/bin:/bin` }, stdout: 'pipe', stderr: 'pipe' })
    const before = run(join(tree, '.bin/meson'))
    expect(before.exitCode, before.stderr.toString()).toBe(0)
    expect(before.stdout.toString()).toBe('Meson entrypoint\nargument with spaces\n')
    const moved = join(root, 'moved pantry')
    renameSync(tree, moved)
    expect(run(join(moved, '.bin/meson')).stdout.toString()).toBe(before.stdout.toString())
    rmSync(join(moved, 'python.org'), { recursive: true })
    const missing = run(join(moved, '.bin/meson'))
    expect(missing.exitCode).toBe(127)
    expect(missing.stdout.toString()).not.toContain('unexpected-host')
    expect(recipe.dependencies?.['python.org']).toBe('~3.12')
    expect(recipe.dependencies?.['pkgx.sh']).toBeUndefined()
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
