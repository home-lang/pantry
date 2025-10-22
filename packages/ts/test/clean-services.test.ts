/* eslint-disable no-console */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

describe('clean command - service shutdown behavior', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cliPath: string

  const runCLI = (args: string[], env?: NodeJS.ProcessEnv, timeoutMs = 15000): Promise<{ exitCode: number, stdout: string, stderr: string }> => {
    return new Promise((resolve) => {
      const proc = spawn('bun', [cliPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env,
      })

      let stdout = ''
      let stderr = ''
      proc.stdout.on('data', d => (stdout += d.toString()))
      proc.stderr.on('data', d => (stderr += d.toString()))

      const to = setTimeout(() => {
        proc.kill('SIGTERM')
        resolve({ exitCode: -1, stdout, stderr: `${stderr}\nTimeout` })
      }, timeoutMs)

      proc.on('close', (code) => {
        clearTimeout(to)
        resolve({ exitCode: code ?? 0, stdout, stderr })
      })
    })
  }

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-clean-services-'))
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

    // Constrain HOME and install prefix to the temp dir; enable test mode for services
    process.env.HOME = tempDir
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'
  })

  afterEach(() => {
    // Restore env
    Object.keys(process.env).forEach((k) => {
      delete process.env[k]
    })
    Object.assign(process.env, originalEnv)
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('dry-run should show services that would be stopped', async () => {
    // Skip on non-macOS platforms where service management differs
    if (process.platform !== 'darwin') {
      console.log('Skipping macOS-specific service test on', process.platform)
      return
    }

    // Prepare a fake user LaunchAgents with a Launchpad plist to simulate a registered service
    const launchAgents = path.join(process.env.HOME!, 'Library', 'LaunchAgents')
    fs.mkdirSync(launchAgents, { recursive: true })
    // Simulate a registered redis service file
    const plistPath = path.join(launchAgents, 'com.launchpad.redis.plist')
    fs.writeFileSync(plistPath, '<?xml version="1.0"?><plist></plist>')

    const env = {
      ...process.env,
      PATH: `/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`,
    }

    const result = await runCLI(['clean', '--dry-run'], env)
    expect(result.exitCode).toBe(0)
    // Should list services that would be stopped
    expect(result.stdout.includes('Services that would be stopped') || result.stdout.includes('🛑 Services that would be stopped:')).toBe(true)
    expect(result.stdout).toContain('redis')
  })

  it('should stop, disable and remove service files before cleaning (keep-global respected)', async () => {
    // Skip on non-macOS platforms where service management differs
    if (process.platform !== 'darwin') {
      console.log('Skipping macOS-specific service test on', process.platform)
      return
    }

    // Create a deps.yaml that marks postgres as global to ensure we do not stop it with --keep-global
    const dotfiles = path.join(process.env.HOME!, '.dotfiles')
    fs.mkdirSync(dotfiles, { recursive: true })
    fs.writeFileSync(path.join(dotfiles, 'deps.yaml'), 'global: true\ndependencies:\n  postgresql.org: ^17.0.0\n')

    // Create service files to simulate registered services
    const launchAgents = path.join(process.env.HOME!, 'Library', 'LaunchAgents')
    fs.mkdirSync(launchAgents, { recursive: true })
    const redisPlist = path.join(launchAgents, 'com.launchpad.redis.plist')
    const postgresPlist = path.join(launchAgents, 'com.launchpad.postgres.plist')
    fs.writeFileSync(redisPlist, 'redis')
    fs.writeFileSync(postgresPlist, 'postgres')

    const env = {
      ...process.env,
      PATH: `/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`,
    }

    // Run clean with keep-global; postgres (global) should be preserved, redis should be stopped/removed
    const result = await runCLI(['clean', '--keep-global', '--force'], env)
    expect(result.exitCode).toBe(0)
    // Redis plist should be removed
    expect(fs.existsSync(redisPlist)).toBe(false)
    // Postgres plist (global) should remain
    expect(fs.existsSync(postgresPlist)).toBe(true)
  })
})
