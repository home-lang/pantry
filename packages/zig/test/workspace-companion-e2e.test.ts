import { describe, expect, it } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const binary = process.env.PANTRY_SOURCE_CLI

// The normal unit pass runs before the CLI is built. CI invokes this suite
// again with the source binary, and verifies its exact commit before testing.
describe.skipIf(!binary)('source CLI companion workspace lifecycle', () => {
  it('locks internal-only workspaces and preserves their lock on companion failures', () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry-companion-workspace-'))
    try {
      const member = join(root, 'packages/local')
      mkdirSync(member, { recursive: true })
      writeFileSync(join(root, 'package.json'), JSON.stringify({
        name: 'pantry-source-workspace',
        version: '1.0.0',
        private: true,
        workspaces: ['packages/*'],
        dependencies: { '@pantry-fixture/local': 'workspace:*' },
      }))
      writeFileSync(join(member, 'package.json'), JSON.stringify({ name: '@pantry-fixture/local', version: '1.0.0', private: true }))
      const deps = join(root, 'deps.yaml')
      writeFileSync(deps, 'dependencies:\n')
      const env = { ...process.env, XDG_DATA_HOME: join(root, 'data'), XDG_CACHE_HOME: join(root, 'cache') }
      function run(args: string[], success = true): string {
        const result = spawnSync(binary!, args, { cwd: root, env, encoding: 'utf8', timeout: 30_000 })
        if (result.error) throw result.error
        const output = result.stdout + result.stderr
        if (success && result.status !== 0) throw new Error(output)
        if (!success) expect(result.status).not.toBe(0)
        return output
      }
      const revision = spawnSync('git', ['rev-parse', '--short=9', 'HEAD'], { cwd: resolve(import.meta.dir, '../../..'), encoding: 'utf8' })
      expect(revision.status).toBe(0)
      expect(run(['--version'])).toContain(revision.stdout.trim())

      run(['install'])
      const lockPath = join(root, 'pantry.lock')
      const committed = readFileSync(lockPath, 'utf8')
      const lock = JSON.parse(committed)
      expect(lock.workspaces[''].dependencies['@pantry-fixture/local']).toBe('workspace:*')
      expect(lock.workspaces['packages/local'].name).toBe('@pantry-fixture/local')
      expect(realpathSync(join(root, 'pantry/@pantry-fixture/local'))).toBe(realpathSync(member))
      run(['install', '--frozen-lockfile'])
      expect(readFileSync(lockPath, 'utf8')).toBe(committed)

      const memberManifest = join(member, 'package.json')
      const originalMember = readFileSync(memberManifest, 'utf8')
      writeFileSync(memberManifest, JSON.stringify({ name: '@pantry-fixture/local', version: '1.0.1', private: true }))
      run(['install', '--frozen-lockfile'], false)
      expect(readFileSync(lockPath, 'utf8')).toBe(committed)
      writeFileSync(memberManifest, originalMember)

      rmSync(deps)
      mkdirSync(deps)
      for (const args of [['install'], ['install', '--force']]) {
        expect(run(args, false)).toContain('Error installing deps.yaml')
        expect(readFileSync(lockPath, 'utf8')).toBe(committed)
        expect(readdirSync(root).filter(name => name.startsWith('.pantry.lock.'))).toEqual([])
      }
      rmSync(deps, { recursive: true })
      writeFileSync(deps, 'dependencies:\n')
      run(['install'])
      expect(readFileSync(lockPath, 'utf8')).toBe(committed)
    }
    finally {
      rmSync(root, { recursive: true, force: true })
    }
  }, 60_000)
})
