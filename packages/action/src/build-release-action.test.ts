import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'bun:test'
import { versionBump } from '@stacksjs/bumpx'
import { buildReleaseAction } from '../../../.github/scripts/build-release-action'

const hook = resolve(import.meta.dir, '../../../.github/scripts/build-release-action.ts')
const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`

test('two normal releases commit their versioned Action outputs and rebuild cleanly', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry action release '))
  try {
    const cwd = join(root, 'project')
    const remote = join(root, 'origin.git')
    mkdirSync(join(cwd, 'packages/action/dist'), { recursive: true })
    const git = (...args: string[]) => {
      const result = Bun.spawnSync(['git', ...args], { cwd, stdout: 'pipe', stderr: 'pipe' })
      assert.equal(result.exitCode, 0, Buffer.from(result.stderr).toString())
      return Buffer.from(result.stdout).toString().trim()
    }
    git('init', '--bare', remote)
    git('init', '-b', 'main')
    git('config', 'user.name', 'Chris Breuer')
    git('config', 'user.email', 'chrisbreuer93@gmail.com')
    git('remote', 'add', 'origin', remote)
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ name: 'release-fixture', version: '1.0.0', private: true, workspaces: ['packages/*'] }))
    writeFileSync(join(cwd, 'packages/action/package.json'), JSON.stringify({ name: 'fixture-action', version: '1.0.0', scripts: { build: 'bun build.ts' } }))
    writeFileSync(join(cwd, 'packages/action/build.ts'), `const { version } = await Bun.file('package.json').json(); await Bun.write('dist/index.js', version); await Bun.write('dist/post.js', version)\n`)
    for (const name of ['index.js', 'post.js']) writeFileSync(join(cwd, 'packages/action/dist', name), '1.0.0')
    git('add', '.')
    git('commit', '-m', 'chore: initialize release fixture')
    git('push', '-u', 'origin', 'main')
    for (const version of ['1.0.1', '1.0.2']) {
      const expectedSource = git('rev-parse', 'HEAD')
      await versionBump({ cwd, release: 'patch', recursive: true, expectedSource, execute: `bun ${quote(hook)}`, commit: true, tag: true, push: true, yes: true, changelog: false, quiet: true })
      assert.equal(git('rev-parse', 'HEAD^'), expectedSource)
      assert.equal(git('rev-parse', 'HEAD'), git('rev-parse', `v${version}^{commit}`))
      assert.ok(git('ls-remote', 'origin', 'refs/heads/main').startsWith(git('rev-parse', 'HEAD')))
      for (const name of ['index.js', 'post.js']) assert.equal(readFileSync(join(cwd, 'packages/action/dist', name), 'utf8'), version)
      buildReleaseAction(cwd)
      assert.equal(git('status', '--porcelain'), '', 'the next normal install/build must not dirty the versioned bundle')
      assert.deepEqual(git('show', '--format=', '--name-only', 'HEAD').split('\n').sort(), ['package.json', 'packages/action/dist/index.js', 'packages/action/dist/post.js', 'packages/action/package.json'].sort())
      assert.doesNotMatch(git('log', '-1', '--format=%B'), /^Co-authored-by:/im)
    }
    const before = git('rev-parse', 'HEAD')
    writeFileSync(join(cwd, 'packages/action/build.ts'), 'process.exit(23)\n')
    assert.throws(() => buildReleaseAction(cwd))
    assert.equal(git('diff', '--cached', '--name-only'), '', 'a failed builder cannot stage release artifacts')
    assert.equal(git('rev-parse', 'HEAD'), before)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
}, 30_000)
