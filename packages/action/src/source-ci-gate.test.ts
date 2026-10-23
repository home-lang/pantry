import { describe, expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { requiredSourceJobs, waitForSourceCi } from '../../../.github/scripts/source-ci-gate'

const repository = 'pantry-pm/pantry'
const sha = 'a'.repeat(40)
const completed = { id: 42, head_sha: sha, head_branch: 'main', event: 'push', path: '.github/workflows/ci.yml', head_repository: { full_name: repository }, status: 'completed', conclusion: 'success', html_url: 'https://github.com/pantry-pm/pantry/actions/runs/42' }
const jobs = () => requiredSourceJobs.map((name, id) => ({ id, name, status: 'completed', conclusion: 'success' }))

describe('full source CI publication and deployment gate', () => {
  test('waits for the exact commit and reads every required job before admission', async () => {
    let clock = 0
    let polls = 0
    const paths: string[] = []
    const result = await waitForSourceCi({ repository, sha, now: () => clock, sleep: async ms => { clock += ms }, budgetMs: 60_000,
      read: async path => {
        paths.push(path)
        if (path.includes('/jobs?')) return { total_count: jobs().length, jobs: jobs() }
        return { workflow_runs: ++polls === 1 ? [{ ...completed, head_sha: 'b'.repeat(40) }] : polls === 2 ? [{ ...completed, status: 'in_progress', conclusion: null }] : [completed] }
      },
    })
    expect(polls).toBe(3)
    expect(result.sha).toBe(sha)
    expect(result.requiredJobs).toHaveLength(14)
    expect(paths.at(-1)).toContain('/runs/42/jobs?')
  })

  test.each(['failure', 'cancelled', 'timed_out', 'neutral', 'skipped'])('refuses a completed %s source verdict', async conclusion => {
    await expect(waitForSourceCi({ repository, sha, read: async () => ({ workflow_runs: [{ ...completed, conclusion }] }) })).rejects.toThrow(`concluded ${conclusion}`)
  })

  test.each(['missing', 'skipped', 'duplicate', 'failed'])('refuses a %s native acceptance job even if the workflow is green', async kind => {
    const actual = jobs()
    if (kind === 'missing') actual.pop()
    else if (kind === 'duplicate') actual.push({ ...actual[0]! })
    else actual[0]!.conclusion = kind === 'skipped' ? 'skipped' : 'failure'
    await expect(waitForSourceCi({ repository, sha, read: async path => path.includes('/jobs?') ? { total_count: actual.length, jobs: actual } : { workflow_runs: [completed] } })).rejects.toThrow('must execute and pass')
  })

  test.each([{ head_branch: 'feature' }, { event: 'pull_request' }, { head_repository: { full_name: 'elsewhere/pantry' } }, { path: '.github/workflows/registry-checks.yml' }])('never substitutes a different source context %j', async patch => {
    let clock = 0
    await expect(waitForSourceCi({ repository, sha, budgetMs: 1, now: () => clock, sleep: async ms => { clock += ms }, read: async () => ({ workflow_runs: [{ ...completed, ...patch }] }) })).rejects.toThrow('No successful full source CI')
  })

  test('reads all job pages and rejects incomplete read-back', async () => {
    let pages = 0
    const result = await waitForSourceCi({ repository, sha, read: async path => {
      if (!path.includes('/jobs?')) return { workflow_runs: [completed] }
      pages++
      return { total_count: 14, jobs: pages === 1 ? jobs().slice(0, 7) : jobs().slice(7) }
    } })
    expect(pages).toBe(2)
    expect(result.requiredJobs).toHaveLength(14)
    await expect(waitForSourceCi({ repository, sha, read: async path => path.includes('/jobs?') ? { total_count: 14, jobs: [] } : { workflow_runs: [completed] } })).rejects.toThrow('Incomplete source CI')
  })

  test('bounds API reads by one deadline and refuses a late successful response', async () => {
    let clock = 0
    const budgets: number[] = []
    await expect(waitForSourceCi({ repository, sha, budgetMs: 1000, now: () => clock, read: async (...args) => {
      budgets.push(args[1])
      clock += 1001
      return { workflow_runs: [completed] }
    } })).rejects.toThrow('exceeded its wait budget')
    expect(budgets).toEqual([1000])
  })

  test('both maintained workflows require full CI before deployment or any publication', async () => {
    const release = Bun.YAML.parse(await readFile(new URL('../../../.github/workflows/release.yml', import.meta.url), 'utf8')) as any
    const deploy = Bun.YAML.parse(await readFile(new URL('../../../.github/workflows/deploy-registry.yml', import.meta.url), 'utf8')) as any
    for (const workflow of [release, deploy]) {
      expect(workflow.jobs['source-ci']?.uses).toBe('./.github/workflows/source-ci-gate.yml')
      expect(workflow.permissions.actions).toBe('read')
    }
    expect([release.jobs.pantry.needs].flat()).toContain('source-ci')
    expect([deploy.jobs.deploy.needs].flat()).toContain('source-ci')
    expect([deploy.jobs.deploy.needs].flat()).toContain('verify')
  })
})
