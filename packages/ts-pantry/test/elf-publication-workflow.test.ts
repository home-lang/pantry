import { expect, test } from 'bun:test'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

test('mirror and download publishers install only their runtime and provision Linux ELF tools', () => {
  const workflow = Bun.YAML.parse(readFileSync(new URL('../../../.github/workflows/mirror.yml', import.meta.url), 'utf8')) as {
    jobs: Record<string, { steps: Array<{ uses?: string, if?: string, with?: { packages?: string, install?: string } }> }>
  }
  for (const name of ['mirror', 'download']) {
    const steps = workflow.jobs[name].steps
    const setup = steps.findIndex(step => step.uses === './packages/action')
    const normalizer = steps.findIndex(step => step.with?.packages === 'nixos.org/patchelf@0.18.0')
    expect(setup).toBeGreaterThan(-1)
    expect(steps[setup].with?.packages).toBe('bun.sh')
    expect(normalizer).toBeGreaterThan(setup)
    expect(steps[normalizer].uses).toBe('./packages/action')
    expect(steps[normalizer].if).toBe("startsWith(matrix.name, 'linux-')")
    expect(steps[normalizer].with?.install).toBe('false')
  }
})

test('targeted mirror dispatch preserves exact selectors and keeps scheduled runs incremental', () => {
  const workflow = Bun.YAML.parse(readFileSync(new URL('../../../.github/workflows/mirror.yml', import.meta.url), 'utf8')) as {
    jobs: Record<string, { steps: Array<{ run?: string }> }>
  }
  const root = mkdtempSync(join(tmpdir(), 'pantry-mirror-dispatch-'))
  try {
    mkdirSync(join(root, 'packages/ts-pantry'), { recursive: true })
    const executable = join(root, 'bun')
    const output = join(root, 'arguments')
    writeFileSync(executable, '#!/bin/sh\nprintf "%s\\n" "$@" > "$ARGUMENTS"\n')
    chmodSync(executable, 0o755)
    for (const job of ['mirror', 'download']) {
      const source = workflow.jobs[job].steps.find(step => step.run?.includes('bun scripts/build-all-packages.ts'))!.run!
      const script = source.replace(/\$\{\{.*?\}\}/g, expression => expression.includes('stripe') ? '0/1' : expression.includes('matrix.name') ? 'linux-x86-64' : '1')
      for (const targeted of [false, true]) {
        for (const repair of [false, true]) {
          const selector = 'openssl.org@1.1.1w,openssl.org@3.6.5;$(touch should-not-execute)'
          // macOS Actions runs the system Bash 3.2, which treats an empty array
          // as unbound under nounset. Do not silently test a Homebrew Bash here.
          const result = spawnSync(process.platform === 'darwin' ? '/bin/bash' : 'bash', ['-c', script], {
            cwd: root,
            env: { ...process.env, PATH: `${root}:${process.env.PATH}`, ARGUMENTS: output, S3_BUCKET: 'test-bucket', AWS_REGION: 'test-region', RUNNER_TEMP: root, TARGET_PACKAGES: targeted ? selector : '', REBUILD_EXISTING: String(repair) },
            encoding: 'utf8',
          })
          expect(result.status, result.stderr).toBe(0)
          const args = readFileSync(output, 'utf8').trim().split('\n')
          expect(args.includes('--force')).toBe(repair)
          expect(args.includes('--package')).toBe(targeted)
          if (targeted) expect(args[args.indexOf('--package') + 1]).toBe(selector)
          expect(args).toContain(job === 'mirror' ? '--mirror-only' : '--download-only')
        }
      }
    }
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('Darwin vendor downloads are selected for the native Mach-O publisher', () => {
  const workflow = Bun.YAML.parse(readFileSync(new URL('../../../.github/workflows/publish-changed-packages.yml', import.meta.url), 'utf8')) as {
    jobs: Record<string, { 'runs-on'?: string, if?: string, strategy?: { matrix: { platform: Array<{ name: string, os: string }> } }, steps: Array<{ name?: string, run?: string }> }>
  }
  const root = mkdtempSync(join(tmpdir(), 'pantry-native-darwin-selection-'))
  try {
    const select = workflow.jobs.detect.steps.find(step => step.name === 'Determine darwin-native domains')!.run!
      .replace('${{ steps.detect.outputs.domains }}', 'bun.com@1.4.3')
    const output = join(root, 'output')
    const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', select], {
      cwd: new URL('..', import.meta.url),
      env: { ...process.env, GITHUB_OUTPUT: output },
      encoding: 'utf8',
    })
    expect(result.status, result.stderr).toBe(0)
    expect(readFileSync(output, 'utf8').trim()).toBe('domains=bun.com@1.4.3')
    const native = workflow.jobs['publish-darwin-native']
    expect(native['runs-on']).toBe('macos-15')
    expect(native.steps.find(step => step.name === 'Build and publish darwin-arm64 (native)')!.run).not.toContain('--source-only')
    expect(workflow.jobs.build.if).toContain("inputs.platform != 'darwin-arm64'")
    expect(workflow.jobs.build.strategy!.matrix.platform.every(platform => platform.name.startsWith('linux-'))).toBe(true)
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('scheduled Darwin mirror and download matrices use native macOS runners', () => {
  const workflow = Bun.YAML.parse(readFileSync(new URL('../../../.github/workflows/mirror.yml', import.meta.url), 'utf8')) as {
    jobs: Record<string, { steps: Array<{ id?: string, run?: string }> }>
  }
  const root = mkdtempSync(join(tmpdir(), 'pantry-mirror-native-matrix-'))
  try {
    const output = join(root, 'output')
    const script = workflow.jobs.setup.steps.find(step => step.id === 'gen')!.run!
    const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', script], {
      env: { ...process.env, PLATFORM: 'darwin-arm64', STRIPES: '1', GITHUB_OUTPUT: output },
      encoding: 'utf8',
    })
    expect(result.status, result.stderr).toBe(0)
    const matrices = Object.fromEntries(readFileSync(output, 'utf8').trim().split('\n').map(line => [line.slice(0, line.indexOf('=')), JSON.parse(line.slice(line.indexOf('=') + 1))]))
    for (const name of ['matrix', 'download_matrix'])
      expect(matrices[name].include).toEqual([{ name: 'darwin-arm64', os: 'macos-15', stripe: '0/1' }])
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
