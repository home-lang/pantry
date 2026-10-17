import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

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
