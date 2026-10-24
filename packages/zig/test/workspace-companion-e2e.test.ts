import { describe, expect, it } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const binary = process.env.PANTRY_SOURCE_CLI

// The normal unit pass runs before the CLI is built. CI invokes this suite
// again with the source binary, and verifies its exact commit before testing.
describe.skipIf(!binary)('source CLI companion workspace lifecycle', () => {
  it('reports required project setup failures and retries only incomplete setup', () => {
    const configurations = [
      { services: { postDatabaseSetup: ['exit 37', 'printf unexpected > after-hook.txt'] } },
      { postSetup: { commands: [{ command: 'exit 37', required: true }, { command: 'printf unexpected > after-hook.txt' }] } },
      { postSetup: { commands: [{ command: 'exit 37' }, { command: 'printf unexpected > after-hook.txt' }] } },
    ]
    for (const config of configurations) {
      const root = mkdtempSync(join(tmpdir(), 'pantry-required-setup-'))
      try {
        mkdirSync(join(root, 'pantry/.bin'), { recursive: true })
        symlinkSync(process.execPath, join(root, 'pantry/.bin/bun'))
        writeFileSync(join(root, 'package.json'), '{"name":"required-setup","private":true}')
        writeFileSync(join(root, 'deps.yaml'), 'dependencies: {}\n')
        const configPath = join(root, 'pantry.config.ts')
        writeFileSync(configPath, `export default ${JSON.stringify(config)}\n`)
        const run = (args = ['install']) => {
          const result = spawnSync(binary!, args, { cwd: root, encoding: 'utf8', timeout: 15_000 })
          if (result.error) throw result.error
          return result
        }
        const failed = run()
        expect(failed.stdout + failed.stderr).toContain('failed (exit 37)')
        expect(failed.status).not.toBe(0)
        expect(existsSync(join(root, 'after-hook.txt'))).toBe(false)
        expect(existsSync(join(root, 'pantry/.postsetup-done'))).toBe(false)

        writeFileSync(configPath, 'export default { services: { postDatabaseSetup: ["printf repaired > after-hook.txt"] } }\n')
        expect(run().status).toBe(0)
        expect(readFileSync(join(root, 'after-hook.txt'), 'utf8')).toBe('repaired')
        expect(existsSync(join(root, 'pantry/.postsetup-done'))).toBe(true)
        writeFileSync(configPath, `export default ${JSON.stringify(config)}\n`)
        expect(run().status).toBe(0)
        expect(run(['install', '--force']).status).not.toBe(0)
        expect(existsSync(join(root, 'pantry/.postsetup-done'))).toBe(false)
      }
      finally { rmSync(root, { recursive: true, force: true }) }
    }
  }, 30_000)

  it('keeps explicitly optional project setup failures nonfatal', () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry-optional-setup-'))
    try {
      mkdirSync(join(root, 'pantry/.bin'), { recursive: true })
      symlinkSync(process.execPath, join(root, 'pantry/.bin/bun'))
      writeFileSync(join(root, 'package.json'), '{"name":"optional-setup","private":true}')
      writeFileSync(join(root, 'deps.yaml'), 'dependencies: {}\n')
      writeFileSync(join(root, 'pantry.config.ts'), 'export default { postSetup: { commands: [{ command: "exit 29", required: false }, { command: "printf continued > after-hook.txt" }] } }\n')
      const result = spawnSync(binary!, ['install'], { cwd: root, encoding: 'utf8', timeout: 15_000 })
      if (result.error) throw result.error
      expect(result.status).toBe(0)
      expect(readFileSync(join(root, 'after-hook.txt'), 'utf8')).toBe('continued')
      expect(existsSync(join(root, 'pantry/.postsetup-done'))).toBe(true)
    }
    finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('bootstraps a companion Bun before completing a fresh JS workspace', () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry-companion-bootstrap-'))
    try {
      const member = join(root, 'packages/local')
      mkdirSync(member, { recursive: true })
      writeFileSync(join(root, 'package.json'), JSON.stringify({
        name: 'pantry-bootstrap-workspace', private: true, workspaces: ['packages/*'],
        dependencies: { '@pantry-fixture/bootstrap': 'workspace:*' },
      }))
      writeFileSync(join(member, 'package.json'), JSON.stringify({ name: '@pantry-fixture/bootstrap', version: '1.0.0' }))
      writeFileSync(join(root, 'deps.yaml'), 'dependencies:\n  bun.sh: 1.4.3\n')
      const env = { ...process.env, PATH: '/usr/bin:/bin', XDG_DATA_HOME: join(root, 'data'), XDG_CACHE_HOME: join(root, 'cache') }
      expect(spawnSync('bun', ['--version'], { env }).error).toBeDefined()
      function run(args: string[], success = true): string {
        const result = spawnSync(binary!, args, { cwd: root, env, encoding: 'utf8', timeout: 45_000 })
        if (result.error) throw result.error
        const output = result.stdout + result.stderr
        if (success && result.status !== 0) throw new Error(output)
        if (!success) expect(result.status).not.toBe(0)
        return output
      }
      run(['install'])
      expect(realpathSync(join(root, 'node_modules/@pantry-fixture/bootstrap'))).toBe(realpathSync(member))
      const bun = spawnSync(join(root, 'pantry/.bin/bun'), ['--version'], { env, encoding: 'utf8' })
      expect(bun.status).toBe(0)
      expect(bun.stdout.trim()).toBe('1.4.3')
      const lockPath = join(root, 'pantry.lock')
      const lock = readFileSync(lockPath, 'utf8')
      expect(JSON.parse(lock).workspaces['packages/local'].name).toBe('@pantry-fixture/bootstrap')
      run(['install', '--frozen-lockfile'])
      expect(readFileSync(lockPath, 'utf8')).toBe(lock)

      // Explicit temporary native tools must honor --no-save just like a
      // workspace install. Keep every existing declaration and lock byte.
      const packageBeforeNoSave = readFileSync(join(root, 'package.json'), 'utf8')
      const depsBeforeNoSave = readFileSync(join(root, 'deps.yaml'), 'utf8')
      run(['install', 'bun.com@1.4.2', '--no-save', '--ignore-scripts'])
      expect(readFileSync(lockPath, 'utf8')).toBe(lock)
      expect(readFileSync(join(root, 'package.json'), 'utf8')).toBe(packageBeforeNoSave)
      expect(readFileSync(join(root, 'deps.yaml'), 'utf8')).toBe(depsBeforeNoSave)
      run(['install'])
      expect(readFileSync(lockPath, 'utf8')).toBe(lock)

      // A real managed Bun lifecycle failure must not publish the staged
      // combined lock, even though the companion runtime installed correctly.
      const manifest = join(root, 'package.json')
      const original = readFileSync(manifest, 'utf8')
      writeFileSync(manifest, JSON.stringify({ ...JSON.parse(original), scripts: { postinstall: 'bun -e "process.exit(27)"' } }))
      expect(run(['install'], false)).toContain('JavaScript dependency installation failed')
      expect(readFileSync(lockPath, 'utf8')).toBe(lock)
      expect(readdirSync(root).filter(name => name.startsWith('.pantry.lock.'))).toEqual([])
      writeFileSync(manifest, original)
      run(['install'])
      expect(readFileSync(lockPath, 'utf8')).toBe(lock)
    }
    finally {
      rmSync(root, { recursive: true, force: true })
    }
  }, 60_000)

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
