import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

interface Step {
  name?: string
  id?: string
  uses?: string
  if?: string
  run?: string
  with?: Record<string, unknown>
}
interface Workflow { jobs: Record<string, { steps?: Step[] }> }
const sources = [
  { file: 'build.yml', jobs: ['build'] },
  { file: 'build-versions.yml', jobs: ['build-targeted', 'build'] },
  { file: 'sync-binaries.yml', jobs: ['sync-prebuilt', 'build-targeted', 'build'] },
]

describe('manual native publisher tool ownership', () => {
  for (const { file, jobs } of sources) {
    const source = readFileSync(new URL(`../../../.github/workflows/${file}`, import.meta.url), 'utf8')
    const workflow = Bun.YAML.parse(source) as Workflow
    test(`${file} keeps system tools in Pantry instead of host package managers`, () => {
      expect(source).not.toMatch(/\b(?:docker|podman|apt-get|rustup)\b|brew (?:install|link)|pip3? install|oven-sh\/setup-bun/)
      for (const job of Object.values(workflow.jobs)) {
        const ids = (job.steps ?? []).flatMap(step => step.id ? [step.id] : [])
        expect(new Set(ids).size).toBe(ids.length)
      }
    })
    for (const job of jobs) {
      test(`${file}:${job} verifies the same managed tools before publication`, () => {
        const steps = workflow.jobs[job]!.steps!
        const selection = steps.findIndex(step => step.id === 'build-tools')
        const installation = steps.findIndex(step => step.name === 'Install native build tools through Pantry')
        const verification = steps.findIndex(step => step.name === 'Verify managed native tool identities')
        expect(selection).toBeGreaterThan(-1)
        expect(installation).toBeGreaterThan(selection)
        expect(verification).toBeGreaterThan(installation)
        expect(steps[selection]!.run).toContain('native-publisher-toolchain.ts --packages')
        expect(steps[installation]!.uses).toBe('./packages/action')
        expect(steps[installation]!.with?.install).toBe('false')
        expect(steps[installation]!.with?.packages).toBe('${{ steps.build-tools.outputs.packages }}')
        expect(steps[verification]!.run).toContain('native-publisher-toolchain.ts')
        expect(steps[verification]!.run).toContain('CC=clang')
        expect(steps[verification]!.run).toContain('CXX=clang++')
        expect(steps[verification]!.run).toContain('LD=ld')
        expect(steps[verification]!.if).toBe(steps[selection]!.if)
        expect(steps[installation]!.if).toBe(steps[selection]!.if)
      })
    }
  }
  test('Windows bootstraps its pinned Bun through the same first-party action', () => {
    const workflow = Bun.YAML.parse(readFileSync(new URL('../../../.github/workflows/build.yml', import.meta.url), 'utf8')) as Workflow
    const windows = workflow.jobs.build!.steps!.find(step => step.name === 'Setup Pantry and Bun (Windows)')!
    expect(windows.if).toBe("runner.os == 'Windows'")
    expect(windows.uses).toBe('./packages/action')
    expect(windows.with?.packages).toBe('bun.com@1.4.3')
  })
})
