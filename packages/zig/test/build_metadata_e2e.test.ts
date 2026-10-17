import { describe, expect, it } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'

const zig = process.env.PANTRY_ZIG_TEST_BIN || Bun.which('zig')

describe('incremental native build metadata', () => {
  const check = zig ? it : it.skip
  check('refreshes the version and Git stamp without clearing the configuration cache', () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry-build-metadata-'))
    try {
      const directory = join(root, 'packages/zig')
      const manifest = join(root, 'packages/ts-pantry/package.json')
      mkdirSync(directory, { recursive: true })
      mkdirSync(join(root, 'packages/ts-pantry'), { recursive: true })
      const source = readFileSync(resolve(import.meta.dir, '../build.zig'), 'utf8')
      const helpers = source.slice(source.indexOf('fn buildRootPathExists'), source.indexOf('/// Resolve dependency path'))
      const metadata = source.slice(source.indexOf('/// Get package version from package.json'))
      expect(helpers).toContain('fn readBuildRootFileAlloc')
      expect(metadata).toContain('fn getGitCommitHash')
      writeFileSync(join(directory, 'build.zig'), `const std = @import("std");
${helpers}
${metadata}
pub fn build(b: *std.Build) void {
    const options = b.addOptions();
    options.addOption([]const u8, "version", getPackageVersion(b) catch @panic("version"));
    options.addOption([]const u8, "commit_hash", getGitCommitHash(b) catch @panic("commit"));
    const output = b.addInstallFile(options.getOutput(), "metadata.zig");
    b.getInstallStep().dependOn(&output.step);
}
`)
      function run(command: string[], cwd = root): string {
        const result = spawnSync(command[0]!, command.slice(1), { cwd, encoding: 'utf8', timeout: 25_000 })
        if (result.error || result.status !== 0) throw new Error(`${command[0]} failed: ${result.error || result.stderr || result.stdout}`)
        return result.stdout.trim()
      }
      function build(buildDirectory = directory): string {
        run([zig!, 'build'], buildDirectory)
        return readFileSync(join(buildDirectory, 'zig-out/metadata.zig'), 'utf8')
      }
      function commit(cwd = root): string {
        run(['git', 'add', '.'], cwd)
        run(['git', '-c', 'user.name=Pantry test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture'], cwd)
        return run(['git', 'rev-parse', '--short=9', 'HEAD'], cwd)
      }
      run(['git', 'init', '-q'])
      writeFileSync(join(root, '.gitignore'), 'packages/zig/.zig-cache/\npackages/zig/zig-out/\n')
      writeFileSync(manifest, JSON.stringify({ name: 'ts-pantry', version: '1.2.3' }))
      const first = commit()
      expect(build()).toContain('"1.2.3"')
      expect(build()).toContain(`"${first}"`)
      run(['git', 'pack-refs', '--all', '--prune'])
      expect(build()).toContain(`"${first}"`)

      writeFileSync(manifest, JSON.stringify({ name: 'ts-pantry', version: '1.2.4' }))
      const changedVersion = build()
      expect(changedVersion).toContain('"1.2.4"')
      expect(changedVersion).toContain(`"${first}"`)
      const second = commit()
      expect(second).not.toBe(first)
      const changedCommit = build()
      expect(changedCommit).toContain('"1.2.4"')
      expect(changedCommit).toContain(`"${second}"`)
      expect(build()).toBe(changedCommit)

      const linked = join(root, 'linked')
      run(['git', 'worktree', 'add', '-q', '-b', 'metadata-linked', linked])
      const linkedDirectory = join(linked, 'packages/zig')
      expect(build(linkedDirectory)).toContain(`"${second}"`)
      run(['git', 'pack-refs', '--all', '--prune'])
      expect(build(linkedDirectory)).toContain(`"${second}"`)
      writeFileSync(join(linked, 'packages/ts-pantry/package.json'), JSON.stringify({ name: 'ts-pantry', version: '1.2.5' }))
      const linkedCommit = commit(linked)
      const linkedBuild = build(linkedDirectory)
      expect(linkedBuild).toContain('"1.2.5"')
      expect(linkedBuild).toContain(`"${linkedCommit}"`)

      const marker = join(linked, '.git')
      const gitDirectory = readFileSync(marker, 'utf8').trim().slice('gitdir:'.length).trim()
      writeFileSync(marker, `gitdir: ${relative(linked, gitDirectory)}\n`)
      expect(build(linkedDirectory)).toBe(linkedBuild)
      run(['git', 'checkout', '-q', '--detach', first], linked)
      const detachedBuild = build(linkedDirectory)
      expect(detachedBuild).toContain('"1.2.3"')
      expect(detachedBuild).toContain(`"${first}"`)
    }
    finally {
      rmSync(root, { recursive: true, force: true })
    }
  }, 60_000)
})
