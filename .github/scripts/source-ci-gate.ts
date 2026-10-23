import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export const requiredSourceJobs = [
  'lint', 'typecheck', 'test', 'zig-tests', 'windows-native-runtime',
  'windows-git', 'native-browser', 'action-native-tools', 'action-redis-service',
  'action-native-services (8.4.11)', 'action-native-services (26.7.0)',
  'Explicit native toolchain pins (ubuntu-latest)',
  'Explicit native toolchain pins (macos-latest)', 'continuous-release',
] as const

interface CiRun {
  id: number
  head_sha: string
  head_branch: string
  event: string
  path: string
  status: string
  conclusion: string | null
  html_url: string
  head_repository: { full_name: string }
}
interface CiJob { id: number, name: string, status: string, conclusion: string | null }
interface GateOptions {
  repository: string
  sha: string
  read: (path: string, timeoutMs: number) => Promise<unknown>
  now?: () => number
  sleep?: (ms: number) => Promise<void>
  budgetMs?: number
}
interface CiGateReceipt {
  repository: string
  sha: string
  workflow: string
  runId: number
  url: string
  requiredJobs: CiJob[]
}

/** Deployment and publication both depend on the full main-push verdict. */
export async function waitForSourceCi(options: GateOptions): Promise<CiGateReceipt> {
  const { repository, sha, read } = options
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^[a-f0-9]{40}$/.test(sha))
    throw new Error('Expected the owning repository and exact source commit')
  const now = options.now ?? Date.now
  const sleep = options.sleep ?? Bun.sleep
  const budget = options.budgetMs ?? 40 * 60_000
  if (!Number.isSafeInteger(budget) || budget <= 0) throw new Error('Expected a positive CI wait budget')
  const deadline = now() + budget
  const readWithinBudget = (path: string): Promise<unknown> => {
    const remaining = deadline - now()
    if (remaining <= 0) throw new Error('Source CI verification exceeded its wait budget')
    return read(path, Math.min(30_000, remaining))
  }
  while (now() < deadline) {
    const response = await readWithinBudget(`repos/${repository}/actions/workflows/ci.yml/runs?branch=main&event=push&head_sha=${sha}&per_page=100`) as { workflow_runs: CiRun[] }
    const run = response.workflow_runs.filter(run => run.head_sha === sha
      && run.head_branch === 'main' && run.event === 'push'
      && run.path === '.github/workflows/ci.yml'
      && run.head_repository.full_name === repository).sort((a, b) => b.id - a.id)[0]
    if (run?.status === 'completed') {
      if (run.conclusion !== 'success')
        throw new Error(`Exact source CI concluded ${run.conclusion}: ${run.html_url}`)
      const jobs: CiJob[] = []
      for (let page = 1; page <= 10; page++) {
        const result = await readWithinBudget(`repos/${repository}/actions/runs/${run.id}/jobs?per_page=100&page=${page}`) as { total_count: number, jobs: CiJob[] }
        jobs.push(...result.jobs)
        if (jobs.length >= result.total_count) break
        if (!result.jobs.length || page === 10) throw new Error('Incomplete source CI job read-back')
      }
      for (const name of requiredSourceJobs) {
        const matches = jobs.filter(job => job.name === name)
        if (matches.length !== 1 || matches[0]!.status !== 'completed' || matches[0]!.conclusion !== 'success')
          throw new Error(`Source CI must execute and pass ${name}`)
      }
      if (now() >= deadline) throw new Error('Source CI verification exceeded its wait budget')
      return { repository, sha, workflow: '.github/workflows/ci.yml', runId: run.id, url: run.html_url, requiredJobs: jobs.filter(job => requiredSourceJobs.some(name => name === job.name)) }
    }
    await sleep(Math.min(15_000, Math.max(0, deadline - now())))
  }
  throw new Error(`No successful full source CI for ${sha} within the wait budget`)
}

if (import.meta.main) {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  if (!token) throw new Error('A GitHub token with actions:read is required')
  const receipt = await waitForSourceCi({
    repository: process.env.GITHUB_REPOSITORY ?? '', sha: process.env.GITHUB_SHA ?? '',
    read: async (path, timeoutMs) => {
      const response = await fetch(`https://api.github.com/${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!response.ok) throw new Error(`Source CI read-back HTTP ${response.status}`)
      return response.json()
    },
  })
  const file = process.argv[2] || 'artifacts/source-ci-gate.json'
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(receipt, null, 2) + '\n')
  console.log(`Verified all ${requiredSourceJobs.length} required source checks: ${receipt.url}`)
}
