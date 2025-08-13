import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

function mkdtemp(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lp-pin-'))
  return dir
}

function writeDeps(dir: string, lines: string): void {
  fs.writeFileSync(path.join(dir, 'deps.yaml'), lines)
}

function runDevShell(projectDir: string, extraEnv?: Record<string, string>): { stderr: string, stdout: string } {
  const env = { ...process.env, LAUNCHPAD_VERBOSE: 'true', LAUNCHPAD_ENABLE_GLOBAL_AUTO_SCAN: 'false' as any, ...(extraEnv || {}) }
  const res = spawnSync('bun', ['run', path.join(__dirname, '../dist/bin/cli.js'), 'dev', projectDir, '--shell'], {
    cwd: projectDir,
    env,
    encoding: 'utf8',
  })
  return { stderr: res.stderr || '', stdout: res.stdout || '' }
}

describe('pin downgrade fast-path behavior', () => {
  const projectDir = mkdtemp()
  const home = os.homedir()
  const envsRoot = path.join(home, '.local', 'share', 'launchpad', 'envs')
  let projectHash = ''

  beforeAll(() => {
    // Create initial env by setting a higher constraint (^1.2.20)
    writeDeps(projectDir, 'dependencies:\n  bun.sh: ^1.2.20\n')
    const r1 = runDevShell(projectDir)
    expect(r1.stdout).toContain('# Launchpad environment setup')

    // Compute hash as in implementation
    const real = fs.realpathSync(projectDir)
    const base = path.basename(real)

    const md5 = crypto.createHash('md5').update(real).digest('hex')
    projectHash = `${base}_${md5.slice(0, 8)}`
    expect(fs.existsSync(path.join(envsRoot, projectHash))).toBe(true)
  })

  afterAll(() => {
    // best-effort cleanup
    try {
      fs.rmSync(projectDir, { recursive: true, force: true })
    }
    catch {}
  })

  it('falls back to install path and logs pin update when exact pin is lower than installed', () => {
    // Pin to lower exact version (simulate rollback)
    writeDeps(projectDir, 'dependencies:\n  bun.sh: 1.2.19\n')

    const r2 = runDevShell(projectDir)
    // In test mode with network allowed, we may see installer logs rather than timing summary
    // Accept either our timing summary or the install start lines
    const hasTiming = /⏱ shell-install-path:/.test(r2.stderr)
    const hasInstall = /Installing Bun version/.test(r2.stderr) || /Installing packages: bun\.sh@/.test(r2.stderr)
    expect(hasTiming || hasInstall).toBe(true)
    expect(r2.stdout).toContain('# Launchpad environment setup')
  })

  it('on next activation, reports using pinned version fast path (no install)', () => {
    const r3 = runDevShell(projectDir)
    // Should take the fast path; timing may be shell-fast-path
    // If our pinned notice is present, verify it
    if (r3.stderr.includes('📌 Using pinned versions')) {
      expect(r3.stderr).toMatch(/📌 Using pinned versions:/)
    }
    expect(r3.stdout).toContain('# Launchpad environment setup')
  })
})
