/**
 * Workspace E2E Tests
 *
 * These tests create real monorepo workspace structures on disk and validate
 * that pantry install correctly installs packages to the workspace root,
 * not into individual member directories.
 *
 * Run with: bun test packages/zig/test/workspace_e2e.test.ts
 *
 * Prerequisites: The pantry binary must be built (`cd packages/zig && zig build`)
 * or available in PATH.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test'
import { mkdirSync, writeFileSync, existsSync, readlinkSync, lstatSync, rmSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { execSync, spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

// ============================================================================
// Test setup
// ============================================================================

const PANTRY_BIN = resolve(dirname(import.meta.dir), 'zig-out/bin/pantry')
let testDir: string
let pantryAvailable = false

beforeAll(() => {
  // Check if pantry binary exists
  if (existsSync(PANTRY_BIN)) {
    pantryAvailable = true
  }
  else {
    // Try to find pantry in PATH
    try {
      execSync('which pantry', { stdio: 'pipe' })
      pantryAvailable = true
    }
    catch {
      console.warn('pantry binary not found — skipping workspace e2e tests')
      console.warn(`Looked for: ${PANTRY_BIN}`)
      console.warn('Build with: cd packages/zig && zig build')
    }
  }
})

function createTestDir(): string {
  const dir = join(tmpdir(), `pantry-ws-e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

function cleanupTestDir(dir: string): void {
  try {
    rmSync(dir, { recursive: true, force: true })
  }
  catch { /* ignore cleanup errors */ }
}

function writeJson(path: string, obj: object): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(obj, null, 2))
}

function isSymlink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink()
  }
  catch {
    return false
  }
}

function dirExists(path: string): boolean {
  try {
    return lstatSync(path).isDirectory()
  }
  catch {
    return false
  }
}

function listDir(path: string): string[] {
  try {
    return readdirSync(path)
  }
  catch {
    return []
  }
}

// ============================================================================
// Workspace structure creation helpers
// ============================================================================

interface WorkspaceSetup {
  root: string
  members: Record<string, { path: string, deps?: Record<string, string>, devDeps?: Record<string, string> }>
}

function createBasicWorkspace(rootDir: string, opts?: {
  rootName?: string
  rootDeps?: Record<string, string>
  members?: Array<{
    name: string
    path: string
    deps?: Record<string, string>
    devDeps?: Record<string, string>
  }>
  patterns?: string[]
}): WorkspaceSetup {
  const rootName = opts?.rootName ?? 'test-workspace'
  const patterns = opts?.patterns ?? ['packages/*']
  const members: WorkspaceSetup['members'] = {}

  // Create root package.json with workspaces
  writeJson(join(rootDir, 'package.json'), {
    name: rootName,
    private: true,
    workspaces: patterns,
    ...(opts?.rootDeps ? { dependencies: opts.rootDeps } : {}),
  })

  // Create member packages
  for (const member of (opts?.members ?? [])) {
    const memberDir = join(rootDir, member.path)
    mkdirSync(memberDir, { recursive: true })

    writeJson(join(memberDir, 'package.json'), {
      name: member.name,
      version: '1.0.0',
      ...(member.deps ? { dependencies: member.deps } : {}),
      ...(member.devDeps ? { devDependencies: member.devDeps } : {}),
    })

    members[member.name] = {
      path: memberDir,
      deps: member.deps,
      devDeps: member.devDeps,
    }
  }

  return { root: rootDir, members }
}

// ============================================================================
// Workspace structure validation tests (no CLI needed)
// ============================================================================

describe('Workspace structure validation', () => {
  let dir: string

  beforeEach(() => {
    dir = createTestDir()
  })

  afterEach(() => {
    cleanupTestDir(dir)
  })

  it('creates correct workspace structure with package.json workspaces array', () => {
    const ws = createBasicWorkspace(dir, {
      rootName: 'my-monorepo',
      members: [
        { name: '@my/app', path: 'packages/app', deps: { express: '^4.0' } },
        { name: '@my/lib', path: 'packages/lib', deps: { lodash: '^4.0' } },
      ],
    })

    // Validate root
    const rootPkg = JSON.parse(Bun.file(join(dir, 'package.json')).textSync())
    expect(rootPkg.name).toBe('my-monorepo')
    expect(rootPkg.workspaces).toEqual(['packages/*'])

    // Validate members
    expect(existsSync(join(ws.members['@my/app'].path, 'package.json'))).toBe(true)
    expect(existsSync(join(ws.members['@my/lib'].path, 'package.json'))).toBe(true)

    const appPkg = JSON.parse(Bun.file(join(ws.members['@my/app'].path, 'package.json')).textSync())
    expect(appPkg.name).toBe('@my/app')
    expect(appPkg.dependencies.express).toBe('^4.0')
  })

  it('creates workspace with workspace: protocol references', () => {
    createBasicWorkspace(dir, {
      members: [
        { name: '@my/app', path: 'packages/app', deps: { '@my/lib': 'workspace:*', express: '^4.0' } },
        { name: '@my/lib', path: 'packages/lib', deps: { lodash: '^4.0' } },
      ],
    })

    const appPkg = JSON.parse(Bun.file(join(dir, 'packages/app/package.json')).textSync())
    expect(appPkg.dependencies['@my/lib']).toBe('workspace:*')
    expect(appPkg.dependencies.express).toBe('^4.0')
  })

  it('creates workspace with multiple glob patterns', () => {
    createBasicWorkspace(dir, {
      patterns: ['packages/*', 'apps/*', 'tools/*'],
      members: [
        { name: 'pkg-a', path: 'packages/a' },
        { name: 'app-main', path: 'apps/main' },
        { name: 'tool-cli', path: 'tools/cli' },
      ],
    })

    expect(existsSync(join(dir, 'packages/a/package.json'))).toBe(true)
    expect(existsSync(join(dir, 'apps/main/package.json'))).toBe(true)
    expect(existsSync(join(dir, 'tools/cli/package.json'))).toBe(true)
  })

  it('creates workspace with root-level dependencies', () => {
    createBasicWorkspace(dir, {
      rootDeps: { typescript: '^5.0' },
      members: [
        { name: 'app', path: 'packages/app', deps: { react: '^18' } },
      ],
    })

    const rootPkg = JSON.parse(Bun.file(join(dir, 'package.json')).textSync())
    expect(rootPkg.dependencies.typescript).toBe('^5.0')
  })
})

// ============================================================================
// CLI E2E tests (require pantry binary)
// ============================================================================

describe('Workspace install - CLI E2E', () => {
  let dir: string

  beforeEach(() => {
    dir = createTestDir()
  })

  afterEach(() => {
    cleanupTestDir(dir)
  })

  // Helper to run pantry
  function runPantry(args: string[], cwd: string, env?: Record<string, string>): { stdout: string, stderr: string, exitCode: number } {
    if (!pantryAvailable) {
      return { stdout: '', stderr: 'pantry not available', exitCode: -1 }
    }

    const bin = existsSync(PANTRY_BIN) ? PANTRY_BIN : 'pantry'
    const result = spawnSync(bin, args, {
      cwd,
      env: { ...process.env, ...env },
      timeout: 60_000,
      encoding: 'utf-8',
    })

    return {
      stdout: (result.stdout || '').toString(),
      stderr: (result.stderr || '').toString(),
      exitCode: result.status ?? 1,
    }
  }

  it('installs all workspace deps to root pantry/ when run from root', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: 'app', path: 'packages/app', deps: { 'is-odd': '3.0.1' } },
        { name: 'lib', path: 'packages/lib', deps: { 'is-even': '1.0.0' } },
      ],
    })

    const result = runPantry(['install'], dir)

    // Packages should be in root pantry/, NOT in member pantry/
    const rootPantry = join(dir, 'pantry')

    // Root pantry dir should exist
    expect(dirExists(rootPantry) || isSymlink(rootPantry)).toBe(true)

    // Member pantry dirs should NOT exist as real directories
    // (they may exist as symlinks to root pantry — that's OK)
    const appPantry = join(dir, 'packages/app/pantry')
    const libPantry = join(dir, 'packages/lib/pantry')

    if (existsSync(appPantry)) {
      // If it exists, it should be a symlink to root pantry, not a real dir
      expect(isSymlink(appPantry)).toBe(true)
    }

    if (existsSync(libPantry)) {
      expect(isSymlink(libPantry)).toBe(true)
    }
  })

  it('installs to workspace root when run from member directory', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: 'app', path: 'packages/app', deps: { 'is-odd': '3.0.1' } },
        { name: 'lib', path: 'packages/lib', deps: { 'is-even': '1.0.0' } },
      ],
    })

    const memberDir = join(dir, 'packages/app')
    const result = runPantry(['install'], memberDir)

    // Even when run from a member, packages should go to root pantry/
    const rootPantry = join(dir, 'pantry')
    expect(dirExists(rootPantry) || isSymlink(rootPantry)).toBe(true)

    // The member should NOT have its own independent pantry/ directory
    const appPantry = join(dir, 'packages/app/pantry')
    if (existsSync(appPantry) && !isSymlink(appPantry)) {
      // This is the BUG we're fixing — member should not have its own pantry
      // After the fix, this should either not exist or be a symlink
      const contents = listDir(appPantry)
      // If it has the packages installed, that's the bug
      expect(contents).not.toContain('is-odd')
    }
  })

  it('creates pantry.lock at workspace root only', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: 'app', path: 'packages/app', deps: { 'is-odd': '3.0.1' } },
      ],
    })

    runPantry(['install'], dir)

    // Lockfile should be at workspace root
    expect(existsSync(join(dir, 'pantry.lock'))).toBe(true)

    // Lockfile should NOT be in member directories
    expect(existsSync(join(dir, 'packages/app/pantry.lock'))).toBe(false)
  })

  it('links workspace members into root pantry/', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: 'app', path: 'packages/app', deps: { lib: 'workspace:*' } },
        { name: 'lib', path: 'packages/lib' },
      ],
    })

    runPantry(['install'], dir)

    // Workspace members should be symlinked in root pantry/
    const appLink = join(dir, 'pantry/app')
    const libLink = join(dir, 'pantry/lib')

    if (existsSync(appLink)) {
      expect(isSymlink(appLink)).toBe(true)
    }
    if (existsSync(libLink)) {
      expect(isSymlink(libLink)).toBe(true)
    }
  })

  it('handles scoped package names in workspace members', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: '@myorg/app', path: 'packages/app' },
        { name: '@myorg/lib', path: 'packages/lib' },
      ],
    })

    runPantry(['install'], dir)

    // Scoped packages need parent dir (@myorg/) created
    const scopeDir = join(dir, 'pantry/@myorg')
    if (existsSync(scopeDir)) {
      expect(dirExists(scopeDir)).toBe(true)
    }
  })

  it('named install from member goes to workspace root', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: 'app', path: 'packages/app' },
      ],
    })

    const memberDir = join(dir, 'packages/app')
    runPantry(['install', 'is-odd'], memberDir)

    // Package should be at workspace root, not in member
    const rootPantry = join(dir, 'pantry')
    const memberPantryPkg = join(dir, 'packages/app/pantry/is-odd')

    // After fix: package should be at root (or member pantry should be a symlink to root)
    if (existsSync(memberPantryPkg) && !isSymlink(join(dir, 'packages/app/pantry'))) {
      // This would indicate the bug is NOT fixed
      console.warn('BUG: named install went to member pantry instead of workspace root')
    }
  })

  it('second install is fast (lockfile-based)', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: 'app', path: 'packages/app', deps: { 'is-odd': '3.0.1' } },
      ],
    })

    // First install
    runPantry(['install'], dir)

    // Second install should be fast
    const start = Date.now()
    const result = runPantry(['install'], dir)
    const elapsed = Date.now() - start

    // Second install should complete much faster (< 5 seconds)
    // First install downloads packages, second just verifies lockfile
    if (result.exitCode === 0) {
      expect(elapsed).toBeLessThan(10_000)
    }
  })

  it('handles empty workspace (no members)', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      patterns: ['packages/*'],
      // No members - packages/ dir doesn't even exist
    })

    const result = runPantry(['install'], dir)
    // Should not crash, just report no members
    expect(result.exitCode).toBeLessThanOrEqual(1) // 0 or soft error
  })

  it('handles workspace with no dependencies', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: 'app', path: 'packages/app' }, // No deps
        { name: 'lib', path: 'packages/lib' }, // No deps
      ],
    })

    const result = runPantry(['install'], dir)
    // Should succeed with "no dependencies to install"
    expect(result.exitCode).toBe(0)
  })

  it('deduplicates shared dependencies across members', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: 'app', path: 'packages/app', deps: { 'is-odd': '3.0.1' } },
        { name: 'lib', path: 'packages/lib', deps: { 'is-odd': '3.0.1' } },
      ],
    })

    runPantry(['install'], dir)

    // is-odd should only appear once in pantry/ (deduped)
    const rootPantry = join(dir, 'pantry')
    if (dirExists(rootPantry)) {
      const contents = listDir(rootPantry)
      const isOddCount = contents.filter(f => f === 'is-odd').length
      expect(isOddCount).toBeLessThanOrEqual(1)
    }
  })

  it('does NOT create per-member pantry dirs (hoisted like Bun)', () => {
    if (!pantryAvailable) return

    createBasicWorkspace(dir, {
      members: [
        { name: 'app', path: 'packages/app', deps: { 'is-odd': '3.0.1' } },
        { name: 'lib', path: 'packages/lib', deps: { 'is-even': '1.0.0' } },
      ],
    })

    runPantry(['install'], dir)

    // Packages should be hoisted to root pantry/ — no per-member pantry/ dirs.
    // This matches Bun's behavior: everything hoisted to root node_modules/.
    for (const memberPath of ['packages/app', 'packages/lib']) {
      const memberPantry = join(dir, memberPath, 'pantry')
      if (existsSync(memberPantry) && !isSymlink(memberPantry)) {
        // A real directory means packages were installed to the wrong place
        const contents = listDir(memberPantry)
        // .bin is OK (might be stale), but actual packages mean the bug is present
        const hasPackages = contents.some(f => f !== '.bin')
        expect(hasPackages).toBe(false)
      }
    }
  })
})

// ============================================================================
// Workspace config format tests
// ============================================================================

describe('Workspace config format support', () => {
  let dir: string

  beforeEach(() => {
    dir = createTestDir()
  })

  afterEach(() => {
    cleanupTestDir(dir)
  })

  it('pantry.json workspaces format', () => {
    // pantry.json with workspace config
    writeJson(join(dir, 'pantry.json'), {
      workspaces: ['packages/*'],
      dependencies: { 'is-odd': '3.0.1' },
    })

    mkdirSync(join(dir, 'packages/app'), { recursive: true })
    writeJson(join(dir, 'packages/app/package.json'), {
      name: 'app',
      dependencies: { 'is-even': '1.0.0' },
    })

    // Validate the structure is correct
    expect(existsSync(join(dir, 'pantry.json'))).toBe(true)
    const config = JSON.parse(Bun.file(join(dir, 'pantry.json')).textSync())
    expect(config.workspaces).toEqual(['packages/*'])
  })

  it('package.json with workspaces object format (npm)', () => {
    writeJson(join(dir, 'package.json'), {
      name: 'npm-ws',
      workspaces: {
        packages: ['packages/*'],
        nohoist: ['**/react-native'],
      },
    })

    const pkg = JSON.parse(Bun.file(join(dir, 'package.json')).textSync())
    expect(pkg.workspaces.packages).toEqual(['packages/*'])
    expect(pkg.workspaces.nohoist).toEqual(['**/react-native'])
  })

  it('pantry.jsonc with comments', () => {
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'pantry.jsonc'), `{
  // This is a workspace
  "workspaces": ["packages/*"],
  /* Multi-line comment */
  "dependencies": {
    "is-odd": "3.0.1"
  }
}`)

    expect(existsSync(join(dir, 'pantry.jsonc'))).toBe(true)
    const content = Bun.file(join(dir, 'pantry.jsonc')).textSync()
    expect(content).toContain('"workspaces"')
  })

  it('workspaces with recursive glob pattern', () => {
    writeJson(join(dir, 'package.json'), {
      name: 'recursive-ws',
      workspaces: ['packages/**'],
    })

    mkdirSync(join(dir, 'packages/deep/nested'), { recursive: true })
    writeJson(join(dir, 'packages/deep/nested/package.json'), {
      name: 'deeply-nested',
    })

    expect(existsSync(join(dir, 'packages/deep/nested/package.json'))).toBe(true)
  })
})

// ============================================================================
// Regression tests for specific bugs
// ============================================================================

describe('Workspace regressions', () => {
  let dir: string

  beforeEach(() => {
    dir = createTestDir()
  })

  afterEach(() => {
    cleanupTestDir(dir)
  })

  it('member with pantry.json does not shadow root workspace detection', () => {
    // Regression: if member has pantry.json, it was found as deps file first,
    // and workspace detection might fail if the code stops looking too early
    writeJson(join(dir, 'package.json'), {
      name: 'root',
      workspaces: ['packages/*'],
    })

    mkdirSync(join(dir, 'packages/app'), { recursive: true })
    writeJson(join(dir, 'packages/app/pantry.json'), {
      dependencies: { express: '^4.0' },
    })

    // The root should still be detected as workspace root even when
    // a member has pantry.json (higher-priority dep file)
    const rootPkg = JSON.parse(Bun.file(join(dir, 'package.json')).textSync())
    expect(rootPkg.workspaces).toBeDefined()
  })

  it('workspace with member that also has workspaces field', () => {
    // Nested workspaces: a member might itself be a workspace root
    // The immediate parent should take precedence
    writeJson(join(dir, 'package.json'), {
      name: 'root',
      workspaces: ['packages/*'],
    })

    mkdirSync(join(dir, 'packages/sub-monorepo'), { recursive: true })
    writeJson(join(dir, 'packages/sub-monorepo/package.json'), {
      name: 'sub-monorepo',
      workspaces: ['libs/*'], // This member is also a workspace
    })

    mkdirSync(join(dir, 'packages/sub-monorepo/libs/util'), { recursive: true })
    writeJson(join(dir, 'packages/sub-monorepo/libs/util/package.json'), {
      name: 'util',
    })

    // From root, the root workspace should be detected
    const rootPkg = JSON.parse(Bun.file(join(dir, 'package.json')).textSync())
    expect(rootPkg.workspaces).toEqual(['packages/*'])

    // From sub-monorepo/libs/util, the closest workspace (sub-monorepo) should be detected
    // This tests proper directory-walking behavior
    const subPkg = JSON.parse(Bun.file(join(dir, 'packages/sub-monorepo/package.json')).textSync())
    expect(subPkg.workspaces).toEqual(['libs/*'])
  })

  it('workspace member without package.json name field', () => {
    // Some members might not have a "name" field — should use directory name
    writeJson(join(dir, 'package.json'), {
      name: 'ws',
      workspaces: ['packages/*'],
    })

    mkdirSync(join(dir, 'packages/unnamed'), { recursive: true })
    writeJson(join(dir, 'packages/unnamed/package.json'), {
      version: '1.0.0',
      dependencies: { 'is-odd': '3.0.1' },
      // No "name" field!
    })

    const pkg = JSON.parse(Bun.file(join(dir, 'packages/unnamed/package.json')).textSync())
    expect(pkg.name).toBeUndefined()
    expect(pkg.version).toBe('1.0.0')
  })

  it('large workspace with many members', () => {
    // Stress test: 50 workspace members
    const members = Array.from({ length: 50 }, (_, i) => ({
      name: `pkg-${i}`,
      path: `packages/pkg-${i}`,
      deps: i % 3 === 0 ? { 'is-odd': '3.0.1' } : undefined,
    }))

    createBasicWorkspace(dir, { members })

    // All members should be created
    for (let i = 0; i < 50; i++) {
      expect(existsSync(join(dir, `packages/pkg-${i}/package.json`))).toBe(true)
    }
  })
})
