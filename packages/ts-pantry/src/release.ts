import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

export type ReleaseType = 'patch' | 'minor' | 'major'

export interface ReleaseOptions {
  /** Release type: patch | minor | major */
  type: ReleaseType
  /** Non-interactive — skip confirmation prompts */
  yes?: boolean
  /** Preview the actions without applying any change */
  dryRun?: boolean
  /** Skip changelog generation */
  noChangelog?: boolean
  /** Skip the final `git push` (commit + tag stay local) */
  noPush?: boolean
  /** Skip the publish step entirely */
  noPublish?: boolean
  /** Working directory of the zig package (default: process.cwd()) */
  cwd?: string
}

export interface ReleaseResult {
  exitCode: number
}

const RED = '\x1B[31m'
const GREEN = '\x1B[32m'
const YELLOW = '\x1B[33m'
const DIM = '\x1B[2m'
const BOLD = '\x1B[1m'
const RESET = '\x1B[0m'

function info(msg: string): void {
  console.log(`${DIM}>${RESET} ${msg}`)
}

function ok(msg: string): void {
  console.log(`${GREEN}✓${RESET} ${msg}`)
}

function warn(msg: string): void {
  console.log(`${YELLOW}!${RESET} ${msg}`)
}

function fail(msg: string): void {
  console.error(`${RED}error:${RESET} ${msg}`)
}

interface RunResult {
  status: number
  stdout: string
  stderr: string
}

function run(cmd: string, args: string[], cwd: string): RunResult {
  const res = spawnSync(cmd, args, { cwd, encoding: 'utf8' })
  return {
    status: res.status ?? (res.error ? 1 : 0),
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? (res.error ? String(res.error.message) : ''),
  }
}

/**
 * Resolve a tool binary (`bump`, `changelog`) by checking, in order:
 *   1. PATH (via `which`)
 *   2. pantry bin dirs (~/.local/bin, ~/pantry/.bin, ~/.pantry/bin)
 *   3. the user's local zig source checkouts (~/Code/Libraries/<repo>/zig-out/bin/<name>)
 */
function findTool(name: string, repoHint: string): string | null {
  const which = spawnSync('which', [name], { encoding: 'utf8' })
  if ((which.status ?? 1) === 0 && which.stdout.trim().length > 0)
    return which.stdout.trim()

  const home = os.homedir()
  const candidates = [
    path.join(home, '.local', 'bin', name),
    path.join(home, 'pantry', '.bin', name),
    path.join(home, '.pantry', 'bin', name),
    path.join(home, 'Code', 'Libraries', repoHint, 'zig-out', 'bin', name),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c))
      return c
  }
  return null
}

/** Read the `.version = "x.y.z"` field from a build.zig.zon file. */
function readZonVersion(zonPath: string): string | null {
  const src = fs.readFileSync(zonPath, 'utf8')
  const m = src.match(/\.version\s*=\s*"([^"]+)"/)
  return m ? m[1] : null
}

/** Sync the `version` field in package.json (if present) to `version`. */
function syncPackageJsonVersion(cwd: string, version: string): boolean {
  const pkgPath = path.join(cwd, 'package.json')
  if (!fs.existsSync(pkgPath))
    return false
  const raw = fs.readFileSync(pkgPath, 'utf8')
  // Preserve formatting by doing a targeted replace of the top-level version field.
  const updated = raw.replace(/("version"\s*:\s*)"[^"]*"/, `$1"${version}"`)
  if (updated === raw)
    return false
  fs.writeFileSync(pkgPath, updated)
  return true
}

/**
 * Run a full release for a Zig package living in `cwd`:
 *   changelog → bump version (file only) → sync package.json → commit → tag → push → publish.
 */
export async function runRelease(options: ReleaseOptions): Promise<ReleaseResult> {
  const cwd = options.cwd ?? process.cwd()
  const zonPath = path.join(cwd, 'build.zig.zon')

  // 1. Detect a zig package.
  if (!fs.existsSync(zonPath)) {
    fail(`no build.zig.zon found in ${cwd}`)
    console.error(`  ${DIM}\`pantry release\` must be run from the root of a Zig package.${RESET}`)
    return { exitCode: 1 }
  }

  // 2. Must be inside a git repo.
  const insideGit = run('git', ['rev-parse', '--is-inside-work-tree'], cwd)
  if (insideGit.status !== 0 || insideGit.stdout.trim() !== 'true') {
    fail('not inside a git repository')
    return { exitCode: 1 }
  }

  // 3. Working tree must be clean (so the release commit is exactly the bump).
  const dirty = run('git', ['status', '--porcelain'], cwd)
  if (dirty.status === 0 && dirty.stdout.trim().length > 0 && !options.dryRun) {
    fail('working tree is not clean — commit or stash your changes first.')
    console.error(dirty.stdout.trimEnd())
    return { exitCode: 1 }
  }

  // 4. Verify there is an upstream to push to (unless pushing is skipped).
  let hasUpstream = false
  if (!options.noPush) {
    const upstream = run('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], cwd)
    hasUpstream = upstream.status === 0 && upstream.stdout.trim().length > 0
    if (!hasUpstream)
      warn('no upstream branch configured — will commit and tag locally (skipping push).')
  }

  const currentVersion = readZonVersion(zonPath)
  if (!currentVersion) {
    fail(`could not read .version from ${zonPath}`)
    return { exitCode: 1 }
  }

  // 5. Locate the bump binary (from zig-bump).
  const bump = findTool('bump', 'zig-bump')
  if (!bump) {
    fail('`bump` binary not found (from zig-bump).')
    console.error(`  ${DIM}Build it: cd ~/Code/Libraries/zig-bump && zig build, or install it onto your PATH.${RESET}`)
    return { exitCode: 1 }
  }

  // 6. Generate / update the changelog (best-effort) from conventional commits.
  if (!options.noChangelog) {
    const changelog = findTool('changelog', 'zig-changelog')
    if (changelog) {
      info('generating changelog from conventional commits...')
      if (options.dryRun) {
        console.log(`  ${DIM}[dry-run] would run: changelog -o CHANGELOG.md${RESET}`)
      }
      else {
        const cl = run(changelog, ['-o', 'CHANGELOG.md'], cwd)
        if (cl.status === 0)
          ok('CHANGELOG.md updated')
        else
          warn(`changelog generation skipped${cl.stderr ? `: ${cl.stderr.trim()}` : ''}`)
      }
    }
    else {
      warn('`changelog` binary not found (from zig-changelog) — skipping changelog.')
    }
  }

  // 7. Bump the version in build.zig.zon (file only; we own the git steps).
  info(`bumping version (${BOLD}${options.type}${RESET}) from ${currentVersion}...`)
  if (options.dryRun) {
    const dry = run(bump, [options.type, '--dry-run', '--yes'], cwd)
    if (dry.stdout.trim())
      console.log(dry.stdout.trimEnd())
    console.log(`  ${DIM}[dry-run] no files changed, no commit/tag/push, no publish.${RESET}`)
    return { exitCode: 0 }
  }

  const bumpRes = run(bump, [options.type, '--no-commit', '--no-tag', '--no-push', '--yes'], cwd)
  if (bumpRes.status !== 0) {
    fail('version bump failed')
    if (bumpRes.stdout.trim())
      console.error(bumpRes.stdout.trimEnd())
    if (bumpRes.stderr.trim())
      console.error(bumpRes.stderr.trimEnd())
    return { exitCode: 1 }
  }

  const newVersion = readZonVersion(zonPath)
  if (!newVersion || newVersion === currentVersion) {
    fail('version did not change after bump')
    return { exitCode: 1 }
  }
  ok(`build.zig.zon ${currentVersion} → ${newVersion}`)

  const tag = `v${newVersion}`

  // Refuse to clobber an existing tag.
  const tagExists = run('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], cwd)
  if (tagExists.status === 0) {
    fail(`tag ${tag} already exists — bump to a version that has no tag yet.`)
    // Roll back the file change so the tree is left clean.
    run('git', ['checkout', '--', 'build.zig.zon'], cwd)
    return { exitCode: 1 }
  }

  // 8. Sync package.json version (if present).
  if (syncPackageJsonVersion(cwd, newVersion))
    ok(`package.json version → ${newVersion}`)

  // 9. Stage + commit the release.
  run('git', ['add', 'build.zig.zon'], cwd)
  if (fs.existsSync(path.join(cwd, 'package.json')))
    run('git', ['add', 'package.json'], cwd)
  if (fs.existsSync(path.join(cwd, 'CHANGELOG.md')))
    run('git', ['add', 'CHANGELOG.md'], cwd)

  const commit = run('git', ['commit', '-m', `chore: release ${tag}`], cwd)
  if (commit.status !== 0) {
    fail('git commit failed')
    if (commit.stderr.trim())
      console.error(commit.stderr.trimEnd())
    return { exitCode: 1 }
  }
  ok(`committed release ${tag}`)

  // 10. Create the annotated tag.
  const tagRes = run('git', ['tag', '-a', tag, '-m', `Release ${tag}`], cwd)
  if (tagRes.status !== 0) {
    fail('git tag failed')
    if (tagRes.stderr.trim())
      console.error(tagRes.stderr.trimEnd())
    return { exitCode: 1 }
  }
  ok(`tagged ${tag}`)

  // 11. Push the commit and the tag.
  if (!options.noPush && hasUpstream) {
    info('pushing commit and tag...')
    const pushCommit = run('git', ['push'], cwd)
    if (pushCommit.status !== 0) {
      fail('git push failed')
      if (pushCommit.stderr.trim())
        console.error(pushCommit.stderr.trimEnd())
      return { exitCode: 1 }
    }
    const pushTag = run('git', ['push', 'origin', tag], cwd)
    if (pushTag.status !== 0) {
      fail(`pushing tag ${tag} failed`)
      if (pushTag.stderr.trim())
        console.error(pushTag.stderr.trimEnd())
      return { exitCode: 1 }
    }
    ok(`pushed commit and tag ${tag}`)
  }
  else {
    warn('skipped push (commit and tag are local only).')
  }

  // 12. Publish to the pantry registry (best-effort / skippable).
  if (!options.noPublish)
    publish(cwd)

  console.log(`\n${GREEN}${BOLD}✓ released ${tag}${RESET}`)
  return { exitCode: 0 }
}

/**
 * Best-effort publish to the pantry registry. The `pantry publish` flow for Zig
 * packages lives in the Zig CLI (`packages/zig`, `pantry publish`). We shell out
 * to whatever `pantry` is on PATH; if it lacks a working `publish` for zig yet,
 * we report it clearly and let the GitHub Action (triggered by the pushed tag)
 * handle publishing instead.
 */
function publish(cwd: string): void {
  const pantry = findTool('pantry', 'pantry')
  if (!pantry) {
    warn('`pantry` binary not found — skipping publish (the pushed tag\'s CI will publish).')
    return
  }
  // Probe: does this pantry build expose a `publish` command?
  const help = run(pantry, ['publish', '--help'], cwd)
  if (help.status !== 0) {
    warn('`pantry publish` is not available in the installed pantry yet — skipping.')
    console.log(`  ${DIM}The pushed tag will trigger CI to publish to the registry.${RESET}`)
    return
  }
  info('publishing to pantry registry...')
  const pub = run(pantry, ['publish'], cwd)
  if (pub.stdout.trim())
    console.log(pub.stdout.trimEnd())
  if (pub.status === 0) {
    ok('published to pantry registry')
  }
  else {
    warn('publish step failed — the pushed tag\'s CI can still publish.')
    if (pub.stderr.trim())
      console.log(`  ${DIM}${pub.stderr.trim()}${RESET}`)
  }
}
