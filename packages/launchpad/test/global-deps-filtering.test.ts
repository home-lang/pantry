import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

function getTestEnv(extra?: Record<string, string>): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NODE_ENV: 'test',
    // Ensure basic PATH so spawned bun can run in CI/dev
    PATH: process.env.PATH?.includes('/usr/local/bin')
      ? process.env.PATH!
      : `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH || ''}`,
    ...extra,
  }
}

describe('Global Deps Filtering (regression)', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempHome: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-global-filtering-'))
  })

  afterEach(() => {
    // Restore environment variables properly without replacing the entire process.env object
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)

    if (fs.existsSync(tempHome)) {
      fs.rmSync(tempHome, { recursive: true, force: true })
    }
  })

  it('installs only explicitly global packages during --global-deps scan', () => {
    // Arrange: create two projects under typical scan locations
    const localOnlyProject = path.join(tempHome, 'Code', 'the-one-otc-api')
    const globalToolsProject = path.join(tempHome, 'Projects', 'global-tools')
    fs.mkdirSync(localOnlyProject, { recursive: true })
    fs.mkdirSync(globalToolsProject, { recursive: true })

    // Local-only deps (should be ignored by --global-deps)
    fs.writeFileSync(
      path.join(localOnlyProject, 'deps.yaml'),
      `dependencies:
  php.net: ^8.4.0
  getcomposer.org: ^2.8.10
`,
      'utf8',
    )

    // Explicitly-global deps (should be included)
    fs.writeFileSync(
      path.join(globalToolsProject, 'dependencies.yaml'),
      `global: true
dependencies:
  bun.sh: ^1.2.19
  starship.rs: ^1.23.0
`,
      'utf8',
    )

    // Act: run CLI with --global in dry-run + verbose to capture listing
    const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

    return new Promise<void>((resolve, reject) => {
      const proc = spawn(
        'bun',
        [cliPath, 'install', '--global', '--dry-run', '--verbose'],
        {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: getTestEnv({ HOME: tempHome }),
        },
      )

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      const timeout = setTimeout(() => {
        try {
          proc.kill()
        }
        catch {}
        reject(new Error('Timed out waiting for CLI output'))
      }, 20000)

      proc.on('close', () => {
        clearTimeout(timeout)
        const output = `${stdout}\n${stderr}`

        try {
          // Should show scan summary
          expect(output).toContain('Found')
          expect(output).toMatch(/dependency files?/)

          // Should list packages that would be installed (only global ones)
          expect(output).toContain('Packages that would be installed')
          // Include explicitly global
          expect(output).toMatch(/bun\.sh/i)
          expect(output).toMatch(/starship\.rs/i)

          // Exclude local-only entries
          expect(output).not.toMatch(/php\.net/i)
          expect(output).not.toMatch(/getcomposer\.org/i)

          // Optional: per-file verbose summary should mention skipped local packages
          // We expect at least one "skipped X local" occurrence
          expect(/skipped\s+\d+\s+local/.test(output)).toBe(true)

          resolve()
        }
        catch (err) {
          reject(err)
        }
      })
    })
  }, 30000)
})
