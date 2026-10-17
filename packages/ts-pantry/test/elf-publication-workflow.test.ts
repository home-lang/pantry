import { expect, test } from 'bun:test'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

test('mirror and download publishers retain workspace setup and provision Linux ELF tools', () => {
  const workflow = Bun.YAML.parse(readFileSync(new URL('../../../.github/workflows/mirror.yml', import.meta.url), 'utf8')) as {
    jobs: Record<string, { steps: Array<{ uses?: string, if?: string, with?: { packages?: string, install?: string } }> }>
  }
  for (const name of ['mirror', 'download']) {
    const steps = workflow.jobs[name].steps
    const setup = steps.findIndex(step => step.uses === './packages/action')
    const normalizer = steps.findIndex(step => step.with?.packages === 'nixos.org/patchelf@0.18.0')
    expect(setup).toBeGreaterThan(-1)
    expect(steps[setup].with?.packages).toBeUndefined()
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
      for (const repair of [false, true]) {
        const selector = 'openssl.org@1.1.1w,openssl.org@3.6.5;$(touch should-not-execute)'
        const result = spawnSync('bash', ['-c', script], {
          cwd: root,
          env: { ...process.env, PATH: `${root}:${process.env.PATH}`, ARGUMENTS: output, S3_BUCKET: 'test-bucket', AWS_REGION: 'test-region', RUNNER_TEMP: root, TARGET_PACKAGES: repair ? selector : '', REBUILD_EXISTING: String(repair) },
          encoding: 'utf8',
        })
        expect(result.status).toBe(0)
        const args = readFileSync(output, 'utf8').trim().split('\n')
        expect(args.includes('--force')).toBe(repair)
        expect(args.includes('--package')).toBe(repair)
        if (repair) expect(args[args.indexOf('--package') + 1]).toBe(selector)
        expect(args).toContain(job === 'mirror' ? '--mirror-only' : '--download-only')
      }
    }
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
