#!/usr/bin/env bun

import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

interface PackageUpdate {
  domain: string
  name: string
  oldVersion: string
  newVersion: string
}

const args = new Map<string, string>()
for (let i = 2; i < process.argv.length; i += 2) {
  if (process.argv[i]?.startsWith('--')) {
    args.set(process.argv[i].slice(2), process.argv[i + 1] || '')
  }
}

const baseRef = args.get('base') || 'HEAD'
const headRef = args.get('head') || 'worktree'
const messageFile = args.get('message-file') || ''

function git(args: string[]): string {
  return execSync(['git', ...args].map(arg => JSON.stringify(arg)).join(' '), {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

function readAt(ref: string, path: string): string {
  if (ref === 'worktree') {
    return existsSync(path) ? readFileSync(path, 'utf8') : ''
  }

  try {
    return git(['show', `${ref}:${path}`])
  }
  catch {
    return ''
  }
}

function changedFiles(): string[] {
  const paths = ['packages/ts-pantry/src/packages/', 'packages/zig/src/packages/generated.zig']
  if (headRef === 'worktree') {
    return git(['status', '--porcelain', ...paths])
      .split('\n')
      .map(line => line.slice(3).trim())
      .filter(Boolean)
  }

  return git(['diff', '--name-only', baseRef, headRef, '--', ...paths])
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

function firstMatch(content: string, pattern: RegExp): string {
  return content.match(pattern)?.[1]?.trim() || ''
}

function parseTsPackage(content: string): Omit<PackageUpdate, 'oldVersion'> | null {
  const domain = firstMatch(content, /domain:\s*'([^']+)'\s+as const/)
  const name = firstMatch(content, /name:\s*'([^']+)'\s+as const/) || domain
  const versions = content.match(/versions:\s*\[([\s\S]*?)\]\s*as const/)?.[1] || ''
  const newVersion = firstMatch(versions, /'([^']+)'/)
  if (!domain || !newVersion) return null
  return { domain, name, newVersion }
}

function parseZigPackages(content: string): Map<string, { name: string, version: string }> {
  const packages = new Map<string, { name: string, version: string }>()
  for (const block of content.split('\n}, .{\n')) {
    const domain = firstMatch(block, /\.domain = "([^"]+)"/)
    const name = firstMatch(block, /\.name = "([^"]+)"/) || domain
    const versions = block.match(/\.versions = &\[_\]\[\]const u8\{([^}]*)\}/)?.[1] || ''
    const version = firstMatch(versions, /"([^"]+)"/)
    if (domain && version) packages.set(domain, { name, version })
  }
  return packages
}

function isPackageMetadataFile(path: string): boolean {
  return path.startsWith('packages/ts-pantry/src/packages/')
    && path.endsWith('.ts')
    && !path.endsWith('/aliases.ts')
    && !path.endsWith('/index.ts')
    && !path.includes('/generated-')
}

const updates = new Map<string, PackageUpdate>()
const files = changedFiles()

for (const file of files.filter(isPackageMetadataFile)) {
  const current = parseTsPackage(readAt(headRef, file))
  if (!current) continue

  const previous = parseTsPackage(readAt(baseRef, file))
  const oldVersion = previous?.newVersion || ''
  if (oldVersion === current.newVersion) continue

  updates.set(current.domain, { ...current, oldVersion })
}

if (files.includes('packages/zig/src/packages/generated.zig')) {
  const previous = parseZigPackages(readAt(baseRef, 'packages/zig/src/packages/generated.zig'))
  const current = parseZigPackages(readAt(headRef, 'packages/zig/src/packages/generated.zig'))
  for (const [domain, next] of current.entries()) {
    if (updates.has(domain)) continue
    const prior = previous.get(domain)
    if (!prior || prior.version === next.version) continue
    updates.set(domain, {
      domain,
      name: next.name,
      oldVersion: prior.version,
      newVersion: next.version,
    })
  }
}

const packageUpdates = [...updates.values()].sort((a, b) => a.domain.localeCompare(b.domain))
const packageLabels = packageUpdates.map(update => update.domain)

function subject(): string {
  if (packageLabels.length === 1) {
    const update = packageUpdates[0]
    return `chore: update ${update.domain} to ${update.newVersion}`
  }
  if (packageLabels.length > 1 && packageLabels.length <= 3) {
    return `chore: update ${packageLabels.join(', ')}`
  }
  if (packageLabels.length > 3) {
    return `chore: update ${packageLabels.slice(0, 3).join(', ')} and ${packageLabels.length - 3} others`
  }
  return 'chore: update package metadata'
}

const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
const repo = process.env.GITHUB_REPOSITORY || 'pantry-pm/pantry'
const runId = process.env.GITHUB_RUN_ID || ''
const runUrl = runId ? `${serverUrl}/${repo}/actions/runs/${runId}` : ''
const workflow = process.env.GITHUB_WORKFLOW || 'Update Packages'

const bodyLines = [
  packageUpdates.length > 0 ? 'Updated packages:' : 'Refreshed generated package metadata.',
  ...packageUpdates.map(update => `- ${update.domain}: ${update.oldVersion || 'new'} -> ${update.newVersion}`),
  '',
  `Workflow: ${workflow}`,
  ...(runUrl ? [`Triggered by: ${runUrl}`] : []),
]

const commitSubject = subject()
const commitBody = bodyLines.join('\n')

console.log(commitSubject)
console.log()
console.log(commitBody)

if (messageFile) {
  writeFileSync(messageFile, `${commitSubject}\n\n${commitBody}\n`)
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `commit_message=${commitSubject}\n`)
  appendFileSync(process.env.GITHUB_OUTPUT, `commit_body<<__PANTRY_COMMIT_BODY__\n${commitBody}\n__PANTRY_COMMIT_BODY__\n`)
}
