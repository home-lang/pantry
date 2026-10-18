#!/usr/bin/env bun

/**
 * Buildkit — Generate bash build scripts from pantry YAML recipes
 *
 * Based on pkgx's brewkit architecture:
 * - Template interpolation (moustaches)
 * - Platform-conditional script steps
 * - Environment variable expansion with platform merging
 * - Working directory support
 * - Prop/fixture inline content
 */

import { cpus } from 'node:os'

// Token for template interpolation
export interface Token {
  from: string
  to: string
}

// ── Parsed YAML recipe types ──────────────────────────────────────────

/** Inline prop content — either a string or object with content/extname.
 * content/contents may be an array of lines (joined with newlines). */
export type RecipePropValue = string | {
  content?: string | string[]
  contents?: string | string[]
  extname?: string
}

/** A single step in a build/test script — either a bare command string or a structured object */
export type RecipeScriptStep = string | {
  run: string | string[]
  'working-directory'?: string
  if?: string
  'if:'?: string
  prop?: RecipePropValue
  fixture?: string | {
    extname: string
    content: string
  }
}

/** Source distributable configuration */
export interface RecipeDistributable {
  url: string
  'strip-components'?: number
  ref?: string
}

/**
 * Dependencies map — domain → version constraint string.
 * May contain platform sub-objects (linux/darwin) whose values are also dependency maps.
 * Uses Record<string, any> because YAML produces mixed domain-keys and platform-keys.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RecipeDependencyMap = Record<string, any>

/**
 * Build environment variables — variable names → string or string array values.
 * May contain platform sub-objects (linux/darwin/aarch64/x86-64) whose values are also env maps.
 * Uses Record<string, any> because YAML produces mixed variable-keys and platform-keys.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RecipeBuildEnv = Record<string, any>

/** Build configuration (after normalization from string/array shorthand) */
export interface RecipeBuildConfig {
  dependencies?: RecipeDependencyMap
  script?: string | RecipeScriptStep[]
  env?: RecipeBuildEnv
  'working-directory'?: string
  skip?: string | string[]
}

/** Test configuration */
export type RecipeTest = string | string[] | {
  script?: string | string[] | RecipeScriptStep[]
  required?: boolean
  fixture?: string | {
    extname: string
    content: string
  }
  dependencies?: RecipeDependencyMap
  env?: RecipeBuildEnv
}

/**
 * Raw YAML recipe — build may be string/array shorthand or object form.
 * Use this for generateBuildScript and initial YAML parsing.
 */
export interface PackageRecipe {
  programs?: string[]
  publish?: { include: string[] }
  sourceablePrograms?: string[]
  distributable?: RecipeDistributable
  dependencies?: RecipeDependencyMap
  buildDependencies?: RecipeDependencyMap
  build?: RecipeBuildConfig | string | RecipeScriptStep[]
  versions?: {
    github?: string
    strip?: string | RegExp
    [key: string]: unknown
  }
  provides?: string[] | Record<string, string[]>
  platforms?: string[]
  test?: RecipeTest
  companions?: RecipeDependencyMap
  warnings?: string[]
}

/**
 * Normalized recipe — build is always object form (after applyRecipeOverrides normalization).
 * Use this for modifyRecipe callbacks where build has been normalized.
 */
export interface NormalizedRecipe extends Omit<PackageRecipe, 'build'> {
  build?: RecipeBuildConfig
}

/**
 * Build the full set of template tokens for interpolation
 * Matches brewkit's useMoustaches.tokenize.all() + tokenizeHost()
 */
export function buildTokens(
  _pkg: string,
  version: string,
  platform: string,
  prefix: string,
  buildDir: string,
  depPaths: Record<string, string>,
  versionTag?: string,
): Token[] {
  const dashIdx = platform.indexOf('-')
  const os = dashIdx === -1 ? platform : platform.slice(0, dashIdx)
  const arch = dashIdx === -1 ? 'x86-64' : platform.slice(dashIdx + 1)
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const archName = (arch === 'arm64' || arch === 'aarch64') ? 'aarch64' : 'x86-64'
  const versionParts = version.split('.')
  const major = versionParts[0] || '0'
  const minor = versionParts[1] || '0'
  const patch = versionParts[2] || '0'

  const tokens: Token[] = [
    // Version tokens
    { from: 'version', to: version },
    { from: 'version.raw', to: version },
    { from: 'version.major', to: major },
    { from: 'version.minor', to: minor },
    { from: 'version.patch', to: patch },
    { from: 'version.marketing', to: `${major}.${minor}` },
    { from: 'version.tag', to: versionTag ?? `v${version}` },

    // Path tokens
    { from: 'prefix', to: prefix },
    { from: 'srcroot', to: buildDir },

    // Hardware tokens (matching brewkit's tokenizeHost)
    { from: 'hw.arch', to: archName },
    { from: 'hw.platform', to: osName },
    { from: 'hw.target', to: `${archName}-${osName}` },
    { from: 'hw.concurrency', to: String(cpus().length) },

    // pkgx compatibility
    { from: 'pkgx.prefix', to: prefix },
    { from: 'pkgx.dir', to: prefix },
  ]

  // Add dependency path tokens: deps.DOMAIN.prefix
  for (const [key, value] of Object.entries(depPaths)) {
    if (key.startsWith('deps.')) {
      tokens.push({ from: key, to: value })
    }
  }

  return tokens
}

/**
 * Apply moustache template interpolation
 * Handles both {{key}} and ${{key}} formats
 */
export function applyTokens(template: string, tokens: Token[]): string {
  if (typeof template !== 'string') return String(template)

  let result = template

  // Handle ${{key}} first (before {{key}} to avoid partial matches)
  result = result.replace(/\$\{\{\s*([^}]+?)\s*\}\}/g, (match, key) => {
    const trimmed = key.trim()
    const token = tokens.find(t => t.from === trimmed)
    return token ? token.to : match
  })

  // Handle {{key}}
  result = result.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key) => {
    const trimmed = key.trim()
    const token = tokens.find(t => t.from === trimmed)
    return token ? token.to : match
  })

  return result
}

/**
 * Evaluate a condition from an `if:` field
 * Supports: platform names, platform/arch combos, version ranges
 * Based on brewkit's getScript condition evaluation
 */
export function evaluateCondition(
  condition: string | undefined,
  platform: string,
  version: string,
): boolean {
  if (!condition) return true

  const dashIdx = platform.indexOf('-')
  const os = dashIdx === -1 ? platform : platform.slice(0, dashIdx)
  const arch = dashIdx === -1 ? 'x86-64' : platform.slice(dashIdx + 1)
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const archName = (arch === 'arm64' || arch === 'aarch64') ? 'aarch64' : 'x86-64'

  // Handle OR conditions (e.g. ">=3.8<3.8.4 || >=3<3.7.8")
  if (condition.includes('||')) {
    return condition.split('||').some(part => evaluateCondition(part.trim(), platform, version))
  }

  // Platform conditions
  if (condition === 'darwin' || condition === 'linux') {
    return osName === condition
  }

  // Architecture conditions
  if (condition === 'aarch64' || condition === 'x86-64') {
    return archName === condition
  }

  // Platform/arch combo (e.g. "darwin/aarch64", "linux/x86-64")
  if (condition.includes('/')) {
    const parts = condition.split('/')
    if (parts.length === 2) {
      const [condOs, condArch] = parts
      // Wildcard platform
      if (condOs === '*') return archName === condArch
      if (condArch === '*') return osName === condOs
      return osName === condOs && archName === condArch
    }
  }

  // Version range conditions
  return evaluateVersionRange(condition, version)
}

/**
 * Evaluate version range conditions like ^2, ~3.9, >=3<3.12, <14
 */
function evaluateVersionRange(range: string, version: string): boolean {
  // Strip prerelease suffix before comparing numeric parts
  const numericVersion = version.includes('-') ? version.slice(0, version.indexOf('-')) : version
  const vParts = numericVersion.split('.').map(s => {
    const n = Number(s)
    return Number.isNaN(n) ? 0 : n
  })

  // Parse compound ranges (e.g. ">=3.8<3.8.4")
  const constraints: Array<{
    op: string
    ver: number[]
  }> = []
  const re = /(>=|<=|>|<|~|\^|=)?(\d+(?:\.\d+){0,10})/g
  let match: RegExpExecArray | null
  while ((match = re.exec(range)) !== null) {
    const op = match[1] || '='
    const ver = match[2].split('.').map(Number)
    constraints.push({ op, ver })
  }

  if (constraints.length === 0) return true

  return constraints.every(({ op, ver }) => {
    switch (op) {
      case '>=': return compareVersions(vParts, ver) >= 0
      case '<=': return compareVersions(vParts, ver) <= 0
      case '>': return compareVersions(vParts, ver) > 0
      case '<': return compareVersions(vParts, ver) < 0
      case '=': return compareVersions(vParts, ver) === 0
      case '^': return caretMatch(vParts, ver)
      case '~': return tildeMatch(vParts, ver)
      default: return true
    }
  })
}

function compareVersions(a: number[], b: number[]): number {
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0
    const bv = b[i] ?? 0
    if (av !== bv) return av - bv
  }
  return 0
}

// ^1.2.3 matches >=1.2.3, <2.0.0; ^0.2.3 matches >=0.2.3, <0.3.0
function caretMatch(version: number[], constraint: number[]): boolean {
  if (compareVersions(version, constraint) < 0) return false
  const upper = [...constraint]
  if (upper[0] === 0) {
    upper[1] = (upper[1] ?? 0) + 1
    upper[2] = 0
  }
else {
    upper[0] = upper[0] + 1
    upper[1] = 0
    upper[2] = 0
  }
  return compareVersions(version, upper) < 0
}

// ~3.9 matches >=3.9.0, <3.10.0
function tildeMatch(version: number[], constraint: number[]): boolean {
  if (compareVersions(version, constraint) < 0) return false
  const upper = [...constraint]
  const bumpIdx = Math.max(0, upper.length - 1)
  upper[bumpIdx] = (upper[bumpIdx] ?? 0) + 1
  return compareVersions(version, upper) < 0
}

/**
 * Merge platform-specific sections into base env
 * Based on brewkit's platform_reduce()
 */
export function platformReduce(
  env: Record<string, any>,
  platform: string,
): Record<string, any> {
  const dashIdx = platform.indexOf('-')
  const os = dashIdx === -1 ? platform : platform.slice(0, dashIdx)
  const arch = dashIdx === -1 ? 'x86-64' : platform.slice(dashIdx + 1)
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const archName = (arch === 'arm64' || arch === 'aarch64') ? 'aarch64' : 'x86-64'

  const result: Record<string, any> = {}

  // First pass: copy non-platform keys
  for (const [key, value] of Object.entries(env)) {
    const platformMatch = key.match(/^(darwin|linux)(?:\/(aarch64|x86-64))?$/)
    const archMatch = key.match(/^(aarch64|x86-64)$/)
    const wildcardMatch = key.match(/^\*\/(aarch64|x86-64)$/)

    if (!platformMatch && !archMatch && !wildcardMatch) {
      result[key] = value
    }
  }

  // Second pass: merge matching platform sections
  for (const [key, value] of Object.entries(env)) {
    let matches = false

    const platformMatch = key.match(/^(darwin|linux)(?:\/(aarch64|x86-64))?$/)
    if (platformMatch) {
      const [, condOs, condArch] = platformMatch
      if (condOs === osName && (!condArch || condArch === archName)) {
        matches = true
      }
    }

    const archMatch = key.match(/^(aarch64|x86-64)$/)
    if (archMatch && archMatch[1] === archName) {
      matches = true
    }

    const wildcardMatch = key.match(/^\*\/(aarch64|x86-64)$/)
    if (wildcardMatch && wildcardMatch[1] === archName) {
      matches = true
    }

    if (matches && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const [subKey, subValue] of Object.entries(value)) {
        // Arrays supplement, scalars replace (brewkit behavior)
        if (Array.isArray(subValue)) {
          if (!result[subKey]) result[subKey] = []
          else if (!Array.isArray(result[subKey])) result[subKey] = [result[subKey]]
          result[subKey].push(...subValue)
        }
else {
          result[subKey] = subValue
        }
      }
    }
  }

  return result
}

/**
 * Expand env object into export statements
 * Based on brewkit's expand_env() + expand_env_obj()
 */
export function expandEnv(
  env: Record<string, any>,
  platform: string,
  tokens: Token[],
): string {
  const reduced = platformReduce(env, platform)
  const lines: string[] = []

  for (const [key, value] of Object.entries(reduced)) {
    let expanded: string

    if (Array.isArray(value)) {
      expanded = value.map(v => transformEnvValue(v, tokens)).join(' ')
    }
else {
      expanded = transformEnvValue(value, tokens)
    }

    // For POSIX shell export: use double quotes around value
    // Escape embedded double quotes for safe shell embedding, then wrap in double quotes
    const cleaned = expanded.trim().replace(/"/g, '\\"')
    lines.push(`export ${key}="${cleaned}"`)
  }

  return lines.join('\n')
}

function transformEnvValue(value: string | number | boolean | null | undefined, tokens: Token[]): string {
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (value === undefined || value === null) return '0'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return applyTokens(value, tokens)
  return String(value)
}

/**
 * Process a build script node (string, array, or object)
 * Based on brewkit's getScript() in usePantry.getScript.ts
 */
export function processScript(
  scriptNode: string | RecipeScriptStep[],
  tokens: Token[],
  platform: string,
  version: string,
): string {
  if (typeof scriptNode === 'string') {
    return applyTokens(scriptNode, tokens)
  }

  if (!Array.isArray(scriptNode)) {
    throw new Error('script node must be a string or array')
  }

  const parts: string[] = []

  for (const item of scriptNode) {
    if (typeof item === 'string') {
      parts.push(applyTokens(item, tokens))
      continue
    }

    if (typeof item === 'object' && item !== null) {
      // Check condition (YAML may use `if` or `if:` key)
      const condition = item.if || item['if:']
      if (condition && !evaluateCondition(String(condition), platform, version)) {
        continue
      }

      // Extract run command
      let run = item.run
      if (run === undefined) {
        // If no run key, skip this item
        continue
      }

      if (Array.isArray(run)) {
        run = run.map((x: string) => applyTokens(String(x), tokens)).join('\n')
      }
else {
        run = applyTokens(String(run), tokens)
      }

      // Handle working-directory
      const wd = item['working-directory']
      if (wd) {
        const expandedWd = applyTokens(wd, tokens)
        // Use a variable to avoid running shell expansions (e.g. $(mktemp -d)) twice
        run = [
          'OLDWD="$PWD"',
          `_BUILDKIT_WD="${expandedWd}"`,
          'mkdir -p "$_BUILDKIT_WD"',
          'cd "$_BUILDKIT_WD"',
          run.trim(),
          'cd "$OLDWD"',
          'unset OLDWD _BUILDKIT_WD',
        ].join('\n')
      }

      // Handle prop (inline content written to temp file)
      if (item.prop) {
        const prop = item.prop
        // content/contents may be a string or an array of lines (join with \n —
        // String([...]) would comma-join and corrupt multi-line prop files).
        const rawContent = typeof prop === 'string'
          ? prop
          : (() => {
              const c = prop.content ?? prop.contents ?? ''
              return Array.isArray(c) ? c.join('\n') : String(c)
            })()
        const propContent = applyTokens(rawContent, tokens)
        const extname = (typeof prop === 'object' && prop.extname) ? `.${prop.extname.replace(/^\./, '')}` : ''
        // Single-quoted heredoc (<<'EOF') prevents bash variable expansion,
        // so we do NOT need to escape $ — content is written literally.
        // Only escape backslashes that aren't already part of an escape sequence.
        run = [
          'OLD_PROP=$PROP',
          `PROP="$(mktemp)${extname}"`,
          `cat <<'DEV_PKGX_EOF' > "$PROP"`,
          propContent,
          'DEV_PKGX_EOF',
          propContent.startsWith('#!') ? 'chmod +x "$PROP"' : '',
          run.trim(),
          'rm -f "$PROP"',
          'if test -n "$OLD_PROP"; then PROP=$OLD_PROP; else unset PROP; fi',
        ].filter(Boolean).join('\n')
      }

      parts.push(run.trim())
    }
  }

  // Join script items with a blank line for readability, but collapse blank
  // lines that immediately follow a backslash line-continuation: a recipe that
  // splits one command across array items (e.g. `./configure --prefix=… \`,
  // `  --disable-debug \`, …) would otherwise get `… \<newline><blankline>…`,
  // and the `\` continues into the empty line — terminating the command early
  // so the next flag runs standalone ("--disable-debug: command not found").
  return parts.join('\n\n').replace(/\\\n\n+/g, '\\\n')
}

/**
 * Generate a complete bash build script from a YAML recipe
 * Based on brewkit's build-script.ts
 */
export function generateBuildScript(
  recipe: PackageRecipe,
  pkg: string,
  version: string,
  platform: string,
  prefix: string,
  buildDir: string,
  depPaths: Record<string, string>,
  versionTag?: string,
  pythonModulePaths: readonly string[] = [],
): string {
  const tokens = buildTokens(pkg, version, platform, prefix, buildDir, depPaths, versionTag)
  const dashIdx = platform.indexOf('-')
  const os = dashIdx === -1 ? platform : platform.slice(0, dashIdx)
  const arch = dashIdx === -1 ? 'x86-64' : platform.slice(dashIdx + 1)
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const archName = (arch === 'arm64' || arch === 'aarch64') ? 'aarch64' : 'x86-64'

  // Cross-platform download fanout: when the TARGET os/arch differs from the
  // HOST (e.g. a linux-x86-64 box producing a darwin-x86-64 download artifact),
  // the build script still RUNS ON THE HOST, but the resolved dependency `bin`
  // binaries (curl, tar, unzip, …) were downloaded for the TARGET arch and
  // cannot execute on the host ("Exec format error"). For foreign targets we
  // must NOT prepend the target-arch dep bin dirs to PATH — the host's system
  // tools have to win. Headers/libs (LIBRARY_PATH/CPATH/pkgconfig) are
  // arch-independent enough to keep; only executable bins are gated.
  const hostOsName = process.platform === 'darwin' ? 'darwin' : 'linux'
  const hostArchName = process.arch === 'arm64' ? 'aarch64' : 'x86-64'
  const isForeignTarget = osName !== hostOsName || archName !== hostArchName

  // Narrow build to object form (or undefined) for property access throughout this function
  const build: RecipeBuildConfig | undefined =
    recipe.build && typeof recipe.build === 'object' && !Array.isArray(recipe.build)
      ? recipe.build
      : undefined

  // Detect Go builds. Go recipes pass the env LDFLAGS straight into `go build
  // -ldflags="$LDFLAGS"`, where they're interpreted by the Go *internal* linker
  // (`go tool link`), NOT the C/external linker. So injecting C-linker flags like
  // -Wl,-rpath,<dir> into LDFLAGS (see darwin rpath block below) makes go tool link
  // abort with "flag provided but not defined: -Wl,-rpath,...". Skip that injection
  // for Go builds. Signal: go.dev in (build)dependencies, or a `go build`/`go install`
  // in the build script.
  const rawScript = typeof recipe.build === 'string'
    ? recipe.build
    : Array.isArray(recipe.build)
      ? recipe.build.join('\n')
      : (build?.script ? (Array.isArray(build.script) ? build.script.join('\n') : String(build.script)) : '')
  const hasGoDep = !!(recipe.buildDependencies?.['go.dev'] || build?.dependencies?.['go.dev'] || recipe.dependencies?.['go.dev'])
  const usesGo = hasGoDep || /\bgo\s+(?:build|install)\b/.test(rawScript)

  const sections: string[] = []

  // Shebang and safety
  sections.push('#!/bin/bash')
  sections.push('set -eo pipefail')
  // nullglob: unmatched globs expand to nothing (prevents "No such file" errors
  // when recipes use patterns like *.la or pkgconfig/*.pc in sed/rm commands)
  sections.push('shopt -s nullglob')
  sections.push('')

  // TMPDIR: keep temp files inside build home to avoid filling /tmp in CI
  // (ported from brewkit's build-script.ts)
  sections.push('# Temp directory inside build dir (avoid filling /tmp in CI)')
  sections.push(`export TMPDIR="${buildDir}/.tmp"; mkdir -p "$TMPDIR"`)
  sections.push('')

  // Default compiler flags (from brewkit's flags())
  // Set BEFORE recipe env so recipes can override if needed
  // Keep only the warning flags THIS compiler understands.
  //
  // The dialect differs between the two: -Wno-error=incompatible-function-
  // pointer-types is clang-only and gcc hard-errors on it ("no option
  // '-Wincompatible-function-pointer-types'"). The branches below pick by
  // TARGET os, and the target does not determine the compiler — a
  // darwin-targeted build on a linux runner is gcc, which is exactly how
  // poppler.freedesktop.org died in CMake's very first testCCompiler step.
  //
  // Probing is a few milliseconds once and removes the whole class, including
  // the reverse case (a clang-only linux runner) and older compilers that
  // predate a flag we assume.
  //
  // Asymmetric on purpose: clang accepts an unknown -Wno-error=X silently, so
  // the probe is a no-op there, while gcc hard-errors — which is precisely the
  // side that was breaking. Adding -Werror=unknown-warning-option to make clang
  // strict too would drop flags that are currently harmless, for no gain.
  sections.push('# Filter compiler flags to those the compiler accepts')
  sections.push('__keep_cflags() {')
  sections.push('  local probe="${TMPDIR:-/tmp}/_ccflag_probe"')
  sections.push('  local kept="" f')
  sections.push('  printf \'int main(void){return 0;}\\n\' > "$probe.c" 2>/dev/null || { echo "$*"; return 0; }')
  sections.push('  for f in "$@"; do')
  // A flag the compiler rejects makes the probe exit non-zero; anything else
  // (no compiler at all, unwritable tmp) falls through to keeping the flag,
  // so this can only ever remove flags that are provably unusable.
  sections.push('    if "${CC:-cc}" "$f" -c "$probe.c" -o "$probe.o" >/dev/null 2>&1; then kept="$kept $f"; fi')
  sections.push('  done')
  sections.push('  rm -f "$probe.c" "$probe.o" 2>/dev/null || true')
  sections.push('  echo "$kept"')
  sections.push('}')
  sections.push('if ! command -v "${CC:-cc}" >/dev/null 2>&1; then __keep_cflags() { echo "$*"; }; fi')
  sections.push('')
  sections.push('# Default compiler flags')
  if (osName === 'darwin') {
    // Use the system's actual macOS version — brew libraries are built for the runner's
    // macOS version, so using a lower target (11.0) causes linker warnings/errors
    sections.push('export MACOSX_DEPLOYMENT_TARGET="${MACOSX_DEPLOYMENT_TARGET:-$(sw_vers -productVersion 2>/dev/null | cut -d. -f1-2 || echo 11.0)}"')
    // NOTE: Do NOT add -Wl,-rpath,prefix to LDFLAGS. The fix-up.ts post-install step
    // handles rpaths correctly (@loader_path/../lib), and DYLD_FALLBACK_LIBRARY_PATH
    // handles runtime library resolution during the build. Adding -Wl,-rpath with the
    // absolute /tmp prefix path conflicts with CMAKE_INSTALL_RPATH on Xcode 26.3+
    // (install_name_tool treats duplicate rpaths as fatal errors).
    // Modern Clang treats these warnings as errors by default, breaking older packages
    // (e.g. pixman 0.40 has incompatible function pointer types)
    sections.push('export CFLAGS="$(__keep_cflags -Wno-error=incompatible-function-pointer-types -Wno-error=int-conversion -Wno-error=implicit-function-declaration) ${CFLAGS:-}"')
    sections.push('export CXXFLAGS="$(__keep_cflags -Wno-error=incompatible-function-pointer-types) ${CXXFLAGS:-}"')
  }
else if (osName === 'linux') {
    // Modern GCC/Clang treat certain warnings as errors (C23 defaults) — relax them.
    // This applies to ALL linux arches (x86-64 AND aarch64); previously it was gated to
    // x86-64 only, which left arm64 C/autotools builds without -fPIC and the relaxed
    // warning flags, causing a large arm64-only failure cohort (ncurses, libnl, etc.).
    // Note: -Wno-error=incompatible-function-pointer-types is Clang-only; GCC has
    // -Wno-error=incompatible-pointer-types instead (GCC errors on the Clang form)
    sections.push('export CFLAGS="-fPIC $(__keep_cflags -Wno-error=implicit-function-declaration -Wno-error=int-conversion -Wno-error=incompatible-pointer-types) ${CFLAGS:-}"')
    sections.push('export CXXFLAGS="-fPIC ${CXXFLAGS:-}"')
  }
  sections.push('')

  // Common setup — set BEFORE recipe env so recipes can override (e.g. certbot's SRCROOT)
  sections.push('# Common setup')
  sections.push('export FORCE_UNSAFE_CONFIGURE=1')
  sections.push(`export SRCROOT="${buildDir}"`)
  // Fix CMake compatibility: modern CMake (3.27+) rejects cmake_minimum_required(VERSION < 3.5)
  // This env var tells CMake to accept older minimum versions (fixes vid.stab, qhull, soxr, etc.)
  sections.push('export CMAKE_POLICY_VERSION_MINIMUM=3.5')
  // Define PKGX_DIR — pkgx-specific variable referenced by ~15 YAML recipes in sed commands.
  // In pkgx, it's the base package directory. In our buildkit, use deps dir as equivalent.
  // Without this, `sed "s|$PKGX_DIR|...|g"` gets an empty pattern and fails.
  // Derive from first dep path (they're all under /tmp/buildkit-deps/), fallback to /tmp/buildkit-deps
  const firstDepPrefix = Object.entries(depPaths).find(([k]) => k.endsWith('.prefix'))?.[1]
  const pkgxDir = firstDepPrefix
    ? firstDepPrefix.split('/').slice(0, 3).join('/') // /tmp/buildkit-deps
    : '/tmp/buildkit-deps'
  sections.push(`export PKGX_DIR="${pkgxDir}"`)
  sections.push(`export pkgx_dir="${pkgxDir}"`)
  sections.push('')

  // Environment from YAML recipe (overrides defaults above)
  if (build?.env) {
    sections.push('# Environment from recipe')
    sections.push(expandEnv(build.env, platform, tokens))
    sections.push('')
  }

  // Keep build state separate from the invoking user's toolchains and caches.
  sections.push('# Isolated build home')
  sections.push(`export HOME="${buildDir}/.home"`)
  sections.push('mkdir -p "$HOME"')
  if (usesGo && !isForeignTarget) {
    const recipeEnv = build?.env ? platformReduce(build.env, platform) : {}
    if (!recipeEnv.GOPATH) sections.push('export GOPATH="$HOME/go"')
    sections.push('mkdir -p "$GOPATH"')
    sections.push('')
  }

  // Node.js / npm / pnpm
  sections.push('# Node.js')
  // Prevent pnpm from auto-downloading a different version when project has
  // "packageManager": "pnpm@X.Y.Z" in package.json. This spawns dozens of
  // worker processes that can crash CI batches with SIGTERM cascades.
  sections.push('export npm_config_manage_package_manager_versions=false')
  sections.push('export COREPACK_ENABLE_STRICT=0')
  sections.push('')

  // Wrap sed to handle nullglob (empty glob → no file args) and use GNU sed on macOS.
  // YAML recipes use GNU sed syntax (sed -i 'pattern' file), but macOS BSD sed requires
  // sed -i '' 'pattern' file. Our wrapper auto-translates when gsed isn't available.
  sections.push('# sed wrapper: use GNU sed on macOS + handle empty nullglob gracefully')
  sections.push('__real_sed="$(command -v gsed 2>/dev/null || command -v sed)"')
  sections.push('__sed_is_gnu=false')
  sections.push('if "$__real_sed" --version 2>&1 | grep -q GNU; then __sed_is_gnu=true; fi')
  sections.push('sed() {')
  // Check if bare -i flag (no suffix) appears anywhere (handles sed -E -i, sed -i, etc.)
  sections.push('  local _has_bare_i=false')
  sections.push('  for _a in "$@"; do')
  sections.push('    if [ "$_a" = "-i" ]; then _has_bare_i=true; break; fi')
  sections.push('  done')
  // With -i flag, we need enough args: flags + pattern + file
  // If too few args (no files due to nullglob), silently succeed
  sections.push('  if $_has_bare_i && [ $# -le 2 ]; then return 0; fi')
  // If BSD sed (not GNU), insert '' after bare -i to provide empty backup extension
  // (BSD sed requires: sed -i '' pattern file; GNU accepts: sed -i pattern file)
  // Flags like -i.bak already have a suffix and don't need translation.
  sections.push('  if ! $__sed_is_gnu && $_has_bare_i; then')
  sections.push('    local _args=()')
  sections.push('    for _a in "$@"; do')
  sections.push('      if [ "$_a" = "-i" ]; then')
  sections.push('        _args+=("-i" "")')
  sections.push('      else')
  sections.push('        _args+=("$_a")')
  sections.push('      fi')
  sections.push('    done')
  sections.push('    "$__real_sed" "${_args[@]}"')
  sections.push('    return')
  sections.push('  fi')
  sections.push('  "$__real_sed" "$@"')
  sections.push('}')
  // Do NOT export -f sed: exported functions pollute child process environments
  // (make, configure) causing "environment: line N: command not found" errors.
  // The wrapper only needs to exist in our build script, not in sub-processes.
  sections.push('')

  // Wrap ln to handle "same file" errors gracefully (caused by HOME symlinks)
  sections.push('# ln wrapper: suppress "same file" errors from redundant symlinks')
  sections.push('__real_ln="$(command -v ln)"')
  sections.push('ln() {')
  sections.push('  local _out; _out=$("$__real_ln" "$@" 2>&1) && return 0')
  sections.push('  if echo "$_out" | grep -q "same file"; then return 0; fi')
  sections.push('  echo "$_out" >&2; return 1')
  sections.push('}')
  sections.push('')

  if (osName === 'darwin') {

    // macOS: install -D shim (GNU extension not available on macOS)
    sections.push('# install -D shim for macOS (GNU extension)')
    sections.push('if ! /usr/bin/install -D /dev/null /tmp/_install_test 2>/dev/null; then')
    sections.push('  install() {')
    sections.push('    local args=() has_D=false')
    sections.push('    for arg in "$@"; do')
    sections.push('      case "$arg" in')
    sections.push('        -D) has_D=true ;;')
    // Handle combined flags like -Dm755, -Dm644 — extract -D, keep -m...
    sections.push('        -D*) has_D=true; args+=("-${arg#-D}") ;;')
    sections.push('        *) args+=("$arg") ;;')
    sections.push('      esac')
    sections.push('    done')
    sections.push('    if $has_D; then')
    // Use bash 3.2 compatible syntax (no negative array indices)
    sections.push('      local last_idx=$(( ${#args[@]} - 1 ))')
    sections.push('      local dest="${args[$last_idx]}"')
    sections.push('      mkdir -p "$(dirname "$dest")"')
    sections.push('    fi')
    sections.push('    /usr/bin/install "${args[@]}"')
    sections.push('  }')
    // Do NOT export -f install: same reason as sed — avoid polluting child environments
    sections.push('fi')
    sections.push('rm -f /tmp/_install_test')
    sections.push('')
  }

  // bkpyvenv shim — creates Python venvs for pip-based packages
  sections.push('# bkpyvenv shim (brewkit compatibility)')
  sections.push('bkpyvenv() {')
  sections.push('  local cmd="$1"; shift')
  sections.push('  case "$cmd" in')
  sections.push('    stage)')
  sections.push('      local _engine="" _prefix="" _ver=""')
  sections.push('      while [ $# -gt 0 ]; do')
  sections.push('        case "$1" in')
  sections.push('          --engine=*) _engine="${1#--engine=}"; shift ;;')
  sections.push('          *) if [ -z "$_prefix" ]; then _prefix="$1"; elif [ -z "$_ver" ]; then _ver="$1"; fi; shift ;;')
  sections.push('        esac')
  sections.push('      done')
  sections.push('      python3 -m venv "$_prefix/venv"')
  sections.push('      "$_prefix/venv/bin/python3" -m ensurepip --upgrade 2>/dev/null || true')
  sections.push('      "$_prefix/venv/bin/pip" install --upgrade pip "setuptools<78" wheel || echo "[buildkit] WARN: setuptools install failed" >&2')
  sections.push('      if [ "$_engine" = "poetry" ]; then')
  sections.push('        "$_prefix/venv/bin/pip" install poetry || echo "[buildkit] WARN: poetry install failed" >&2')
  sections.push('        "$_prefix/venv/bin/pip" install --upgrade packaging || echo "[buildkit] WARN: packaging upgrade failed" >&2')
  sections.push('      fi')
  sections.push('      # Add venv bin to PATH so recipe scripts find venv tools (poetry, etc)')
  sections.push('      export PATH="$_prefix/venv/bin:$PATH"')
  sections.push('      ;;')
  sections.push('    seal)')
  sections.push('      local engine="" prefix=""')
  sections.push('      while [ $# -gt 0 ]; do')
  sections.push('        case "$1" in')
  sections.push('          --engine=*) engine="${1#--engine=}"; shift ;;')
  sections.push('          *) if [ -z "$prefix" ]; then prefix="$1"; else break; fi; shift ;;')
  sections.push('        esac')
  sections.push('      done')
  sections.push('      mkdir -p "$prefix/bin"')
  sections.push('      for cmd_name in "$@"; do')
  sections.push('        if [ -f "$prefix/venv/bin/$cmd_name" ]; then')
  sections.push('          printf \'#!/bin/sh\\nSCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"\\nVENV_DIR="$SCRIPT_DIR/../venv"\\nSEARCH_DIR="$SCRIPT_DIR"\\nPYTHON_BIN=""\\nwhile [ "$SEARCH_DIR" != "/" ]; do\\n  if [ -x "$SEARCH_DIR/.bin/python3" ]; then PYTHON_BIN="$SEARCH_DIR/.bin/python3"; break; fi\\n  if [ -x "$SEARCH_DIR/bin/python3" ] && [ "$SEARCH_DIR/bin/python3" != "$VENV_DIR/bin/python3" ]; then PYTHON_BIN="$SEARCH_DIR/bin/python3"; break; fi\\n  SEARCH_DIR="$(dirname "$SEARCH_DIR")"\\ndone\\nif [ -z "$PYTHON_BIN" ]; then PYTHON_BIN="$(command -v python3 2>/dev/null || true)"; fi\\nif [ -z "$PYTHON_BIN" ]; then echo "pantry: Python runtime is required for %s" >&2; exit 127; fi\\nexec "$PYTHON_BIN" "$VENV_DIR/bin/%s" "$@"\\n\' "$cmd_name" "$cmd_name" > "$prefix/bin/$cmd_name"')
  sections.push('          chmod +x "$prefix/bin/$cmd_name"')
  sections.push('        fi')
  sections.push('      done')
  sections.push('      ;;')
  sections.push('  esac')
  sections.push('}')
  // Do NOT export -f bkpyvenv: only called from our build script, not child processes
  sections.push('')

  // python-venv.sh shim
  sections.push('# python-venv.sh shim (pkgx compatibility)')
  sections.push('python-venv.sh() {')
  sections.push('  local target="$1"')
  sections.push('  local prefix; prefix="$(dirname "$(dirname "$target")")"')
  sections.push('  local cmd_name; cmd_name="$(basename "$target")"')
  sections.push('  python3 -m venv "$prefix/venv"')
  sections.push('  "$prefix/venv/bin/python3" -m ensurepip --upgrade 2>/dev/null || true')
  sections.push('  "$prefix/venv/bin/pip" install --upgrade pip "setuptools<78" wheel || echo "[buildkit] WARN: setuptools install failed" >&2')
  // cd to SRCROOT if set — some recipes point SRCROOT to a subdirectory (e.g., certbot)
  sections.push('  local _pip_dir="."')
  sections.push('  if [ -n "$SRCROOT" ] && [ -d "$SRCROOT" ]; then _pip_dir="$SRCROOT"; fi')
  sections.push('  "$prefix/venv/bin/pip" install "$_pip_dir" 2>&1 || {')
  sections.push('    echo "[buildkit] Retrying pip install with --no-build-isolation..."')
  sections.push('    "$prefix/venv/bin/pip" install --no-build-isolation "$_pip_dir"')
  sections.push('  }')
  sections.push('  mkdir -p "$(dirname "$target")"')
  sections.push('  if [ -f "$prefix/venv/bin/$cmd_name" ]; then')
  sections.push('    printf \'#!/bin/sh\\nSCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"\\nexec "$SCRIPT_DIR/../venv/bin/%s" "$@"\\n\' "$cmd_name" > "$target"')
  sections.push('    chmod +x "$target"')
  sections.push('  fi')
  sections.push('}')
  // Do NOT export -f python-venv.sh: only called from our build script
  sections.push('')

  // python-venv.py — create executable script in build dir so YAML recipes can call it as a command
  sections.push('# python-venv.py script (pkgx compatibility — some recipes call python-venv.py instead of .sh)')
  sections.push('mkdir -p "${SRCROOT:-$PWD}/.tmp"')
  sections.push('cat > "${SRCROOT:-$PWD}/.tmp/python-venv.py" << \'PVENV_EOF\'')
  sections.push('#!/bin/bash')
  sections.push('# python-venv.py shim — same logic as python-venv.sh')
  sections.push('target="$1"')
  sections.push('prefix="$(dirname "$(dirname "$target")")"')
  sections.push('cmd_name="$(basename "$target")"')
  sections.push('python3 -m venv "$prefix/venv"')
  sections.push('"$prefix/venv/bin/python3" -m ensurepip --upgrade 2>/dev/null || true')
  sections.push('"$prefix/venv/bin/pip" install --upgrade pip "setuptools<78" wheel || echo "[buildkit] WARN: setuptools install failed" >&2')
  sections.push('_pip_dir="."')
  sections.push('if [ -n "$SRCROOT" ] && [ -d "$SRCROOT" ]; then _pip_dir="$SRCROOT"; fi')
  sections.push('"$prefix/venv/bin/pip" install "$_pip_dir" 2>&1 || {')
  sections.push('  echo "[buildkit] Retrying pip install with --no-build-isolation..."')
  sections.push('  "$prefix/venv/bin/pip" install --no-build-isolation "$_pip_dir"')
  sections.push('}')
  sections.push('mkdir -p "$(dirname "$target")"')
  sections.push('if [ -f "$prefix/venv/bin/$cmd_name" ]; then')
  sections.push('  printf \'#!/bin/sh\\nSCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"\\nexec "$SCRIPT_DIR/../venv/bin/%s" "$@"\\n\' "$cmd_name" > "$target"')
  sections.push('  chmod +x "$target"')
  sections.push('fi')
  sections.push('PVENV_EOF')
  sections.push('chmod +x "${SRCROOT:-$PWD}/.tmp/python-venv.py"')
  sections.push('export PATH="${SRCROOT:-$PWD}/.tmp:$PATH"')
  sections.push('')

  // fix-shebangs.ts shim — replaces hardcoded interpreter paths with #!/usr/bin/env
  sections.push('# fix-shebangs.ts shim (brewkit compatibility)')
  sections.push('fix-shebangs.ts() {')
  sections.push('  for f in "$@"; do')
  sections.push('    [ -f "$f" ] || continue')
  sections.push('    local first_line')
  sections.push('    first_line="$(head -1 "$f")"')
  sections.push('    case "$first_line" in')
  sections.push('      "#!"*)')
  sections.push('        local interp')
  sections.push('        interp="$(basename "$(echo "$first_line" | sed "s|^#![[:space:]]*||" | awk "{print \\$1}")")"')
  sections.push('        case "$interp" in')
  sections.push('          perl*|python*|ruby*|lua*|wish*|tclsh*|node*|bash*|sh*|env)')
  sections.push('            if [ "$interp" = "env" ]; then continue; fi')
  sections.push('            sed -i.bak "1s|.*|#!/usr/bin/env $interp|" "$f"')
  sections.push('            rm -f "$f.bak"')
  sections.push('            ;;')
  sections.push('        esac')
  sections.push('        ;;')
  sections.push('    esac')
  sections.push('  done')
  sections.push('}')
  // Do NOT export -f fix-shebangs.ts: only called from our build script
  sections.push('')

  // Add dependency paths to PATH and pkg-config
  const depBinPaths: string[] = []
  const depLibPaths: string[] = []
  const depIncludePaths: string[] = []
  if (pythonModulePaths.length) {
    const quoted = `'${pythonModulePaths.join(':').replaceAll("'", "'\\''")}'`
    sections.push(`export PYTHONPATH=${quoted}:"\${PYTHONPATH:-}"`)
    sections.push('export PYTHONNOUSERSITE=1')
  }
  const depPkgConfigPaths: string[] = []
  const depAclocalPaths: string[] = []
  // The autoconf dep's data dir (share/autoconf). autom4te/autoreconf locate their
  // m4 macros (m4sugar/m4sugar.m4 etc.) relative to the binary via a fragile in-script
  // relocation; pointing autom4te_perllibdir/AC_MACRODIR at the staged data dir bypasses
  // that entirely (the script reads `$ENV{autom4te_perllibdir} || <fallback>`).
  let autoconfDataDir = ''

  for (const [key, depPath] of Object.entries(depPaths)) {
    // Only use .prefix keys for PATH construction (skip .version, .version.major, etc.)
    if (!key.endsWith('.prefix')) continue
    depBinPaths.push(`${depPath}/bin`)
    if (key.startsWith('build-tools.')) continue
    depLibPaths.push(`${depPath}/lib`, `${depPath}/lib64`)
    depAclocalPaths.push(`${depPath}/share/aclocal`)
    if (key.includes('gnu.org/autoconf'))
      autoconfDataDir = `${depPath}/share/autoconf`
    // A dep whose prefix fell back to a system root (/usr, /usr/local) would
    // contribute /usr/include to CPATH — which the comment below warns breaks
    // GCC header resolution: forcing /usr/include onto CPATH (≈ -I/usr/include)
    // reorders the multiarch search so e.g. <poll.h>'s bits/poll.h chain no
    // longer resolves, producing "incomplete type 'struct pollfd'" (perl ext/IO)
    // and similar. Those system roots are already in the compiler's default
    // search path, so skip their include dir entirely.
    if (depPath !== '/usr' && depPath !== '/usr/local' && depPath !== '/') {
      depIncludePaths.push(`${depPath}/include`)
    }
    depPkgConfigPaths.push(`${depPath}/lib/pkgconfig`, `${depPath}/lib64/pkgconfig`)
    depPkgConfigPaths.push(`${depPath}/share/pkgconfig`)
  }

  if (depBinPaths.length > 0 || depLibPaths.length > 0 || depPkgConfigPaths.length > 0) {
    sections.push('# Dependency paths')
    if (depBinPaths.length > 0) {
      if (isForeignTarget) {
        // Foreign-target download build: the dep bins are the TARGET arch and
        // can't run on this host. Make sure the host's system tool dirs are on
        // PATH, then append (not prepend) the dep bins so the host's curl/tar/
        // unzip/etc. win. The download script only needs basic host tools.
        sections.push('# Foreign-target build: prefer HOST system tools over target-arch dep bins')
        sections.push('case ":$PATH:" in *:/usr/local/bin:*) ;; *) export PATH="$PATH:/usr/local/bin" ;; esac')
        sections.push('case ":$PATH:" in *:/usr/bin:*) ;; *) export PATH="$PATH:/usr/bin" ;; esac')
        sections.push('case ":$PATH:" in *:/bin:*) ;; *) export PATH="$PATH:/bin" ;; esac')
        sections.push(`export PATH="$PATH:${depBinPaths.join(':')}"`)
      }
      else {
        sections.push(`export PATH="${depBinPaths.join(':')}:$PATH"`)
      }
    }
    if (depLibPaths.length > 0) {
      sections.push(`export LIBRARY_PATH="${depLibPaths.join(':')}"`)
      sections.push(`export LD_LIBRARY_PATH="${depLibPaths.join(':')}"`)
      if (!usesGo) {
        // Compiler drivers may search their standard library directories before
        // LIBRARY_PATH. Explicit target paths keep headers and linked ABIs paired.
        const searchFlags = [...new Set(depLibPaths)].map(p => `-L${p}`).join(' ')
        sections.push(`export LDFLAGS="${searchFlags} \${LDFLAGS:-}"`)
      }
      if (osName === 'darwin' && !usesGo) {
        // Dep dylibs ship @rpath-style install names (e.g. @rpath/libxslt.1.dylib).
        // configure's compile-and-RUN probes (PostgreSQL's "checking test program")
        // must resolve those, but DYLD_* can't help: SIP strips DYLD_* from the
        // /bin/sh that runs ./configure, and @rpath refs need a real LC_RPATH, not
        // DYLD_LIBRARY_PATH. So add an -rpath per dep lib dir to LDFLAGS — probe (and
        // final) binaries then carry rpath entries that load the dep dylibs. These are
        // dep dirs only (never the install prefix), so they don't collide with the
        // CMAKE_INSTALL_RPATH whose duplicates install_name_tool rejects.
        // Deduplicate: multiple dependency keys can share the same prefix across
        // deps, and modern dyld (macOS 15+) aborts on a duplicate LC_RPATH at runtime.
        //
        // SKIP for Go builds (usesGo): Go recipes feed LDFLAGS into
        // `go build -ldflags="$LDFLAGS"`, where it reaches the Go internal linker
        // (`go tool link`), which rejects C-linker flags like -Wl,-rpath,<dir> with
        // "flag provided but not defined". Go produces static binaries that don't need
        // dep-dylib rpaths anyway, and any cgo external-link flags go via CGO_LDFLAGS.
        const rpathFlags = [...new Set(depLibPaths)].map(p => `-Wl,-rpath,${p}`).join(' ')
        sections.push(`export LDFLAGS="${rpathFlags} \${LDFLAGS:-}"`)
      }
    }
    if (depIncludePaths.length > 0) {
      sections.push(`export CPATH="${depIncludePaths.join(':')}"`)
    }
    if (depPkgConfigPaths.length > 0) {
      sections.push(`export PKG_CONFIG_PATH="${depPkgConfigPaths.join(':')}"`)
      sections.push(`export PKG_CONFIG_LIBDIR="${depPkgConfigPaths.join(':')}"`)
    }
    if (depAclocalPaths.length > 0) {
      // Let aclocal find dep-provided .m4 macros (libtool, pkg-config, gettext, …).
      sections.push(`export ACLOCAL_PATH="${depAclocalPaths.join(':')}:\${ACLOCAL_PATH:-}"`)
    }
    if (autoconfDataDir) {
      // autom4te reads `$ENV{autom4te_perllibdir} || <relocated fallback>` and
      // `$ENV{AC_MACRODIR} || …`; setting these to the staged share/autoconf makes
      // autoreconf find m4sugar/* regardless of the in-script relocation.
      sections.push(`export autom4te_perllibdir="${autoconfDataDir}"`)
      sections.push(`export AC_MACRODIR="${autoconfDataDir}"`)
    }
    // CMAKE_PREFIX_PATH: help CMake find deps (ported from brewkit)
    const depPrefixes = Object.entries(depPaths)
      .filter(([k]) => k.endsWith('.prefix'))
      .map(([, v]) => v)
    if (depPrefixes.length > 0) {
      sections.push(`export CMAKE_PREFIX_PATH="${depPrefixes.join(':')}"`)
    }

    sections.push('')
  }

  // Compiler wrapper: filter -Werror, resolve -shared/-pie conflicts, and work around
  // GCC ./specs directory issue. On Linux (Ubuntu 24.04), GCC reads `./specs` from CWD.
  // If a source tree has a `specs/` directory (x.org packages), GCC fails with:
  //   "fatal error: cannot read spec file './specs': Is a directory"
  // The wrapper detects this and runs GCC from /tmp with absolute paths.
  sections.push('# Compiler wrapper: strip -Werror, resolve -shared/-pie conflicts (from brewkit)')
  sections.push('# Also works around GCC ./specs directory issue on Linux')
  sections.push('__setup_cc_wrapper() {')
  sections.push('  local wrapper_dir="${TMPDIR:-/tmp}/_cc_wrapper"')
  sections.push('  mkdir -p "$wrapper_dir"')
  sections.push('  for cc_name in cc gcc clang c++ g++ clang++ cpp gfortran; do')
  sections.push('    local real_cc')
  sections.push('    local selected_cc="$cc_name"')
  sections.push('    case "$cc_name" in')
  sections.push('      cc|gcc|clang) selected_cc="${CC:-$cc_name}" ;;')
  sections.push('      c++|g++|clang++) selected_cc="${CXX:-$cc_name}" ;;')
  sections.push('    esac')
  sections.push('    real_cc="$(command -v "$selected_cc" 2>/dev/null || true)"')
  sections.push('    [ -n "$real_cc" ] || continue')
  // Quote the selected path once; the literal body preserves every caller arg.
  sections.push('    printf \'#!/bin/bash\\nreal_cc=%q\\n\' "$real_cc" > "$wrapper_dir/$cc_name"')
  sections.push('    cat >> "$wrapper_dir/$cc_name" <<\'CCEOF\'')
  sections.push('args=()')
  // GCC can retain a configured absolute assembler/linker path after its
  // package is relocated. PATH alone does not override that search order.
  // Pair managed GCC with the resolved managed binutils using GCC's public
  // -B option, rather than silently invoking the worker's older /usr/bin/as.
  const gccPrefix = depPaths['deps.gnu.org/gcc.prefix']
  const binutilsPrefix = depPaths['deps.gnu.org/binutils.prefix']
  if (osName === 'linux' && gccPrefix && binutilsPrefix && !['/usr', '/usr/local', '/'].includes(binutilsPrefix)) {
    sections.push('case "$real_cc" in')
    sections.push(`  '${gccPrefix}/'*) args+=("-B${binutilsPrefix}/bin/") ;;`)
    sections.push('esac')
  }
  sections.push('has_shared=false')
  sections.push('for arg in "$@"; do')
  sections.push('  case "$arg" in')
  sections.push('    -Werror|-Werror=*) continue ;;  # filter -Werror (brewkit shim)')
  sections.push('    -force_cpusubtype_ALL|-Wl,-force_cpusubtype_ALL) continue ;;  # obsolete Apple linker flag')
  // Strip LTO flags. GCC 14+ fat-LTO objects encode the LTO bytecode with the
  // `.base64` assembler directive (binutils >= 2.42); when the `as` paired with
  // the build`s gcc predates that, EVERY compile fails at assembly ("unknown
  // pseudo-op: `.base64`"), which silently breaks CMake try_compile feature
  // detection (FindThreads, timer_create, …). LTO is an optional optimization,
  // so dropping it yields correct binaries on any gcc/as pairing. Inherited
  // dpkg-buildflags (`-flto=auto -ffat-lto-objects`) are the usual source.
  sections.push('    -flto|-flto=*|-ffat-lto-objects|-fno-fat-lto-objects|-flto-partition=*) continue ;;  # strip LTO (fat-LTO emits .base64; mismatched as rejects it)')
  sections.push('    -shared) has_shared=true; args+=("$arg") ;;')
  sections.push('    *) args+=("$arg") ;;')
  sections.push('  esac')
  sections.push('done')
  sections.push('# When building shared libs (-shared), strip -pie which causes')
  sections.push('# "undefined reference to main" (brewkit shim)')
  sections.push('if $has_shared; then')
  sections.push('  new_args=()')
  sections.push('  for arg in "${args[@]}"; do')
  sections.push('    [ "$arg" = "-pie" ] || new_args+=("$arg")')
  sections.push('  done')
  sections.push('  args=("${new_args[@]}")')
  sections.push('fi')
  // On Linux, strip -isystem /usr/include from compiler args.
  // cmake packages (e.g. gflags from apt) compute /usr/include dynamically from their
  // install prefix, so scrubbing cmake config files can't catch it.
  // -isystem /usr/include breaks GCC's #include_next <stdlib.h> by changing the
  // header search order so GCC's internal fixed headers aren't found.
  sections.push('# Strip -isystem /usr/include on Linux (breaks GCC #include_next)')
  sections.push('if [ "$(uname)" = "Linux" ]; then')
  sections.push('  _clean=(); _i=0')
  sections.push('  while [ $_i -lt ${#args[@]} ]; do')
  sections.push('    if [ "${args[$_i]}" = "-isystem" ] && [ $((_i+1)) -lt ${#args[@]} ]; then')
  sections.push('      case "${args[$((_i+1))]}" in')
  sections.push('        /usr/include|/usr/local/include) _i=$((_i+2)); continue ;;')
  sections.push('      esac')
  sections.push('    fi')
  sections.push('    _clean+=("${args[$_i]}"); _i=$((_i+1))')
  sections.push('  done')
  sections.push('  args=("${_clean[@]}")')
  sections.push('fi')
  // Force fat-LTO off for GCC on Linux. GCC fat-LTO objects encode the LTO
  // bytecode with the `.base64` assembler directive (binutils >= 2.42); when the
  // `as` paired with the build's gcc predates it, EVERY compile dies at assembly
  // ("unknown pseudo-op: `.base64`"), silently failing CMake try_compile probes.
  // Inherited dpkg-buildflags AND gcc's own spec defaults can add
  // `-ffat-lto-objects`, so stripping the arg isn't enough — append
  // `-fno-fat-lto-objects -fno-lto` LAST so they override any earlier/implicit
  // LTO (GCC takes the last LTO flag). Skipped for clang (no such flag) and
  // non-Linux. LTO is optional; binaries stay correct.
  sections.push('case "__REAL_CC__" in')
  sections.push('  *clang*) ;;')
  sections.push('  *) [ "$(uname)" = "Linux" ] && args+=("-fno-fat-lto-objects" "-fno-lto") ;;')
  sections.push('esac')
  // GCC specs workaround: if ./specs is a directory, run GCC from /tmp
  // to prevent "fatal error: cannot read spec file './specs': Is a directory"
  // We convert relative file paths to absolute so GCC can still find them.
  sections.push('# macOS Xcode 26.3+: use classic linker to avoid "duplicate linked dylib"')
  sections.push('# hard errors, and suppress duplicate library warnings.')
  sections.push('# Add for ALL link commands (shared libs AND executables), not compile-only.')
  sections.push('if [ "$(uname)" = "Darwin" ]; then')
  sections.push('  _is_compile_only=false')
  sections.push('  for arg in "${args[@]}"; do')
  sections.push('    case "$arg" in -c|-S|-E|-M|-MM) _is_compile_only=true ;; esac')
  sections.push('  done')
  sections.push('  if ! $_is_compile_only; then')
  sections.push('    args+=("-Wl,-ld_classic" "-Wl,-no_warn_duplicate_libraries")')
  sections.push('  fi')
  // Drop duplicate -Wl,-rpath,<path> flags: our LDFLAGS, the package configure
  // (--with-x), and libtool all add the same dep rpaths, and modern dyld aborts
  // on a duplicate LC_RPATH — which silently breaks autotools compile-and-run
  // probes (e.g. PHP\'s iconv-errno check). The darwin exec path below uses
  // "${args[@]}" directly (the Linux _final_args fix-up loop never runs here),
  // so we must dedupe args itself.
  sections.push('  _dedup_args=(); _seen_rpaths=":"')
  sections.push('  for arg in "${args[@]}"; do')
  sections.push('    case "$arg" in')
  sections.push('      -Wl,-rpath,*)')
  sections.push('        _rp="${arg#-Wl,-rpath,}"')
  sections.push('        case "$_seen_rpaths" in')
  sections.push('          *":$_rp:"*) continue ;;')
  sections.push('          *) _seen_rpaths="$_seen_rpaths$_rp:" ;;')
  sections.push('        esac ;;')
  sections.push('    esac')
  sections.push('    _dedup_args+=("$arg")')
  sections.push('  done')
  sections.push('  args=("${_dedup_args[@]}")')
  sections.push('fi')
  sections.push('# GCC specs/ directory workaround: run from /tmp if ./specs is a directory')
  sections.push('# Only on Linux — macOS clang does not read ./specs, and the CWD change')
  sections.push('# breaks -Wl,-force_load,./relative paths embedded in linker flags')
  sections.push('if [ "$(uname)" = "Linux" ] && [ -d "$PWD/specs" ]; then')
  sections.push('  _orig_cwd="$PWD"')
  sections.push('  _final_args=()')
  sections.push('  _next_is_output=false')
  sections.push('  _has_output=false')
  sections.push('  _has_compile_only=false')
  sections.push('  _last_source=""')
  // Track -rpath values so duplicates (which modern dyld aborts on — breaking
  // configure compile-and-run probes) are dropped, no matter how many sources
  // — our LDFLAGS, the package's own --with-x flags, libtool — add the same one.
  sections.push('  _seen_rpaths=":"')
  sections.push('  for _a in "${args[@]}"; do')
  sections.push('    if $_next_is_output; then')
  sections.push('      case "$_a" in /*) _final_args+=("$_a") ;; *) _final_args+=("$_orig_cwd/$_a") ;; esac')
  sections.push('      _next_is_output=false')
  sections.push('      continue')
  sections.push('    fi')
  sections.push('    case "$_a" in')
  sections.push('      -o) _final_args+=("$_a"); _next_is_output=true; _has_output=true ;;')
  sections.push('      -c) _final_args+=("$_a"); _has_compile_only=true ;;')
  // Convert -I/-L/-isystem with relative paths to absolute
  sections.push('      -I/*|-L/*) _final_args+=("$_a") ;;')
  sections.push('      -I*) _final_args+=("-I$_orig_cwd/${_a#-I}") ;;')
  sections.push('      -L*) _final_args+=("-L$_orig_cwd/${_a#-L}") ;;')
  sections.push('      -isystem) _final_args+=("$_a"); _next_is_output=true ;;')
  sections.push('      -include) _final_args+=("$_a"); _next_is_output=true ;;')
  sections.push('      -MF) _final_args+=("$_a"); _next_is_output=true ;;')
  // Source files: convert relative paths to absolute if the file exists
  sections.push('      *.c|*.cc|*.cpp|*.cxx|*.C|*.S|*.s|*.m|*.mm|*.f|*.f90|*.F|*.F90)')
  sections.push('        _last_source="$_a"')
  sections.push('        if [ "${_a:0:1}" != "/" ] && [ -f "$_orig_cwd/$_a" ]; then')
  sections.push('          _final_args+=("$_orig_cwd/$_a")')
  sections.push('        else')
  sections.push('          _final_args+=("$_a")')
  sections.push('        fi ;;')
  // .o files and other relative paths that look like files
  sections.push('      *.o|*.lo|*.la|*.a|*.so|*.dylib)')
  sections.push('        if [ "${_a:0:1}" != "/" ]; then')
  sections.push('          _final_args+=("$_orig_cwd/$_a")')
  sections.push('        else')
  sections.push('          _final_args+=("$_a")')
  sections.push('        fi ;;')
  // Drop duplicate -Wl,-rpath,<path> flags (dyld aborts on duplicate LC_RPATH).
  sections.push('      -Wl,-rpath,*)')
  sections.push('        _rp="${_a#-Wl,-rpath,}"')
  sections.push('        case "$_seen_rpaths" in')
  sections.push('          *":$_rp:"*) ;;')
  sections.push('          *) _seen_rpaths="$_seen_rpaths$_rp:"; _final_args+=("$_a") ;;')
  sections.push('        esac ;;')
  sections.push('      *) _final_args+=("$_a") ;;')
  sections.push('    esac')
  sections.push('  done')
  // When no -o flag is present, gcc outputs to CWD. Since we cd to /tmp,
  // outputs would land in /tmp instead of the original CWD. Fix:
  // - Link mode (no -c): gcc defaults to ./a.out — add -o $orig/a.out
  // - Compile-only (-c): gcc defaults to ./source.o — add -o $orig/source.o
  // Critical for autotools' "checking whether the C compiler works" test
  // which intentionally strips -o from the link command.
  // Only add default -o when source files are present (not for preprocessor
  // invocations like "cpp -" or "gcc -E -" which write to stdout)
  sections.push('  if ! $_has_output && [ -n "$_last_source" ]; then')
  sections.push('    if $_has_compile_only; then')
  sections.push('      _src_base="${_last_source##*/}"')
  sections.push('      _obj_name="${_src_base%.*}.o"')
  sections.push('      _final_args+=("-o" "$_orig_cwd/$_obj_name")')
  sections.push('    else')
  sections.push('      _final_args+=("-o" "$_orig_cwd/a.out")')
  sections.push('    fi')
  sections.push('  fi')
  sections.push('  cd /tmp')
  sections.push('  "$real_cc" "${_final_args[@]}"')
  sections.push('  _rc=$?')
  sections.push('  cd "$_orig_cwd"')
  sections.push('  exit $_rc')
  sections.push('fi')
  sections.push('exec "$real_cc" "${args[@]}"')
  sections.push('CCEOF')
  sections.push('    chmod +x "$wrapper_dir/$cc_name"')
  sections.push('  done')
  sections.push('  export PATH="$wrapper_dir:$PATH"')
  sections.push('}')
  sections.push('__setup_cc_wrapper')
  // Set CC/CXX to our wrappers so cmake uses them instead of finding /usr/bin/c++ directly.
  // Without this, cmake's compiler detection resolves absolute paths and bypasses our wrapper,
  // which means our -isystem /usr/include stripping doesn't take effect.
  sections.push('_ccw="${TMPDIR:-/tmp}/_cc_wrapper"')
  sections.push('[ -x "$_ccw/cc" ] && export CC="$_ccw/cc"')
  sections.push('[ -x "$_ccw/c++" ] && export CXX="$_ccw/c++"')
  sections.push('')

  // Ensure gfortran is available: brew installs gcc which provides gfortran-14,
  // but configure scripts look for plain "gfortran". Create a wrapper if needed.
  sections.push('# Ensure gfortran is available (brew gcc provides gfortran-NN)')
  sections.push('if ! command -v gfortran &>/dev/null; then')
  sections.push('  for _gf in gfortran-{14,13,12,11}; do')
  sections.push('    if command -v "$_gf" &>/dev/null; then')
  sections.push('      ln -sf "$(command -v "$_gf")" "${TMPDIR:-/tmp}/_cc_wrapper/gfortran"')
  sections.push('      break')
  sections.push('    fi')
  sections.push('  done')
  sections.push('fi')
  sections.push('')

  // Diagnostic: verify compiler can create executables (helps debug configure failures)
  // Test from CWD (like configure does) to verify the specs/ workaround works
  sections.push('# Compiler diagnostic (tests from CWD like configure does)')
  sections.push('echo "int main(){return 0;}" > conftest_buildkit.c')
  sections.push('if gcc -o conftest_buildkit conftest_buildkit.c 2>"$TMPDIR/_cc_diag.log"; then')
  sections.push('  echo "[buildkit] compiler check (CWD): OK ($(which gcc))"')
  sections.push('else')
  sections.push('  echo "[buildkit] compiler check (CWD): FAILED" >&2')
  sections.push('  echo "[buildkit] CWD=$PWD" >&2')
  sections.push('  echo "[buildkit] specs dir exists: $([ -d specs ] && echo YES || echo NO)" >&2')
  sections.push('  cat "$TMPDIR/_cc_diag.log" >&2')
  // Also dump the wrapper script for debugging
  sections.push('  echo "[buildkit] wrapper script:" >&2')
  sections.push('  cat "$(which gcc)" >&2')
  sections.push('fi')
  sections.push('rm -f conftest_buildkit.c conftest_buildkit "$TMPDIR/_cc_diag.log"')
  sections.push('')

  // macOS: force system AR/RANLIB when binutils is a dep (brewkit)
  // "gcc needs Apple's ar/ranlib combo on darwin or link failure occurs"
  if (osName === 'darwin') {
    sections.push('# Force system AR/RANLIB on macOS (brewkit: avoids link failures with gcc)')
    sections.push('if [ -x /usr/bin/ar ]; then export AR=/usr/bin/ar; fi')
    sections.push('if [ -x /usr/bin/ranlib ]; then export RANLIB=/usr/bin/ranlib; fi')
    sections.push('')
    // macOS: create glibtool/glibtoolize symlinks if not present.
    // Many Makefiles (libvterm, libtom) call `glibtool` (the Homebrew name for
    // GNU libtool on macOS). If only `libtool` is available (from S3 dep or
    // /opt/homebrew), create wrapper symlinks in the cc_wrapper dir.
    sections.push('# Ensure glibtool is available on macOS (GNU libtool alias)')
    sections.push('if ! command -v glibtool &>/dev/null; then')
    sections.push('  if command -v libtool &>/dev/null; then')
    sections.push('    _lt="$(command -v libtool)"')
    sections.push('    if "$_lt" --version 2>/dev/null | head -1 | grep -qi "GNU\\|libtool"; then')
    sections.push('      ln -sf "$_lt" "${TMPDIR:-/tmp}/_cc_wrapper/glibtool" 2>/dev/null || true')
    sections.push('    fi')
    sections.push('  fi')
    sections.push('fi')
    sections.push('if ! command -v glibtoolize &>/dev/null; then')
    sections.push('  if command -v libtoolize &>/dev/null; then')
    sections.push('    ln -sf "$(command -v libtoolize)" "${TMPDIR:-/tmp}/_cc_wrapper/glibtoolize" 2>/dev/null || true')
    sections.push('  fi')
    sections.push('fi')
    sections.push('')
  }

  // Go source builds use the recipe's resolved compiler. A missing version
  // belongs in the declared dependency graph, never in a host-tool fallback or
  // Go's automatic compiler download path.
  if (usesGo && !isForeignTarget) {
    const goPrefix = depPaths['deps.go.dev.prefix']
    if (!goPrefix) throw new Error('Go source builds require a resolved declared go.dev dependency')
    sections.push('# Managed Go toolchain')
    sections.push(`test -x "${goPrefix}/bin/go" || { echo 'The declared Go compiler is unavailable' >&2; exit 1; }`)
    sections.push(`export GOROOT="${goPrefix}"`)
    sections.push('export GOTOOLCHAIN=local')
    sections.push('export PATH="$GOROOT/bin:$GOPATH/bin:$PATH"')
    sections.push('')
  }

  // Set JAVA_HOME from openjdk.org dep if available (must come AFTER dep paths)
  const openjdkPrefix = depPaths['deps.openjdk.org.prefix']
  if (openjdkPrefix) {
    sections.push('# Set JAVA_HOME from openjdk.org dependency')
    sections.push(`if [ -d "${openjdkPrefix}" ]; then`)
    sections.push(`  export JAVA_HOME="${openjdkPrefix}"`)
    sections.push(`  export PATH="$JAVA_HOME/bin:$PATH"`)
    sections.push('fi')
    sections.push('')
  }

  // Working directory — always cd to buildDir first, then to any subdirectory
  sections.push(`cd "${buildDir}"`)
  const wd = build?.['working-directory']
  if (wd) {
    const expandedWd = applyTokens(wd, tokens)
    // Use a variable to avoid running shell expansions (e.g. $(mktemp -d)) twice
    sections.push(`_BUILDKIT_WD="${expandedWd}"`)
    sections.push('mkdir -p "$_BUILDKIT_WD"')
    sections.push('cd "$_BUILDKIT_WD"')
  }
  sections.push('')

  // Git init for Python packages that use setuptools-scm (ported from brewkit's bkpyvenv)
  // Many Python builds fail without git metadata for version detection
  sections.push('# Git init for setuptools-scm compatibility (brewkit)')
  sections.push('if [ ! -d .git ] && { [ -f setup.py ] || [ -f pyproject.toml ]; }; then')
  sections.push('  git init -q 2>/dev/null || true')
  sections.push('  git config user.name "buildkit" 2>/dev/null || true')
  sections.push('  git config user.email "buildkit@local" 2>/dev/null || true')
  sections.push('  git add -A 2>/dev/null || true')
  sections.push('  git commit -qm "init" --allow-empty 2>/dev/null || true')
  sections.push(`  git tag -a "v${version}" -m "v${version}" --force 2>/dev/null || true`)
  sections.push('fi')
  sections.push('')

  // User script from pantry YAML
  // Handle `build: { script: [...] }`, `build: [...]` (direct array), and `build: "cmd"` (string) formats
  const buildScript = typeof recipe.build === 'string' ? [recipe.build] : Array.isArray(recipe.build) ? recipe.build : recipe.build?.script
  if (buildScript) {
    sections.push('# Build script from pantry recipe')
    sections.push(processScript(buildScript, tokens, platform, version))
  }
else {
    sections.push('echo "No build script found in recipe"')
    sections.push('exit 1')
  }


  return sections.join('\n')
}

/**
 * Get skip list from recipe
 */
export function getSkips(recipe: PackageRecipe): string[] {
  const build = recipe.build
  if (!build || typeof build === 'string' || Array.isArray(build)) return []
  const skip = build.skip
  if (!skip) return []
  if (typeof skip === 'string') return [skip]
  if (Array.isArray(skip)) return skip
  return []
}
