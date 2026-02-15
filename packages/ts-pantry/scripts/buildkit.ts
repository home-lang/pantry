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

// Parsed YAML recipe types
export interface PackageRecipe {
  distributable?: {
    url: string
    'strip-components'?: number
    ref?: string
  }
  dependencies?: Record<string, any>
  build?: {
    dependencies?: Record<string, any>
    script?: any // string | array of strings/objects
    env?: Record<string, any>
    'working-directory'?: string
    skip?: string | string[]
  }
  versions?: any
  provides?: string[] | Record<string, string[]>
}

/**
 * Build the full set of template tokens for interpolation
 * Matches brewkit's useMoustaches.tokenize.all() + tokenizeHost()
 */
export function buildTokens(
  pkg: string,
  version: string,
  platform: string,
  prefix: string,
  buildDir: string,
  depPaths: Record<string, string>,
): Token[] {
  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const archName = arch === 'arm64' ? 'aarch64' : 'x86-64'
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
    { from: 'version.tag', to: `v${version}` },

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

  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const archName = arch === 'arm64' ? 'aarch64' : 'x86-64'

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
  const vParts = version.split('.').map(Number)

  // Parse compound ranges (e.g. ">=3.8<3.8.4")
  const constraints: { op: string; ver: number[] }[] = []
  const re = /(>=|<=|>|<|~|\^|=)?(\d+(?:\.\d+)*)/g
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
  } else {
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
  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const archName = arch === 'arm64' ? 'aarch64' : 'x86-64'

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
        } else {
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
    } else {
      expanded = transformEnvValue(value, tokens)
    }

    // For POSIX shell export: use double quotes around value
    // Remove inner quotes that came from YAML (e.g. --prefix="{{prefix}}")
    // since we're already wrapping in double quotes
    const cleaned = expanded.trim().replace(/"/g, '')
    lines.push(`export ${key}="${cleaned}"`)
  }

  return lines.join('\n')
}

function transformEnvValue(value: any, tokens: Token[]): string {
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
  scriptNode: any,
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
      // Check condition
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
      } else {
        run = applyTokens(String(run), tokens)
      }

      // Handle working-directory
      const wd = item['working-directory']
      if (wd) {
        const expandedWd = applyTokens(wd, tokens)
        run = [
          'OLDWD="$PWD"',
          `mkdir -p "${expandedWd}"`,
          `cd "${expandedWd}"`,
          run.trim(),
          'cd "$OLDWD"',
          'unset OLDWD',
        ].join('\n')
      }

      // Handle prop (inline content written to temp file)
      if (item.prop) {
        const propContent = applyTokens(
          typeof item.prop === 'string' ? item.prop : String(item.prop.content || item.prop.contents || ''),
          tokens,
        )
        const extname = item.prop?.extname ? `.${item.prop.extname.replace(/^\./, '')}` : ''
        const escapedProp = propContent.replace(/\$/g, '\\$')

        run = [
          'OLD_PROP=$PROP',
          `PROP=$(mktemp)${extname}`,
          `cat <<'DEV_PKGX_EOF' > $PROP`,
          escapedProp,
          'DEV_PKGX_EOF',
          propContent.startsWith('#!') ? 'chmod +x $PROP' : '',
          run.trim(),
          'rm -f $PROP*',
          'if test -n "$OLD_PROP"; then PROP=$OLD_PROP; else unset PROP; fi',
        ].filter(Boolean).join('\n')
      }

      parts.push(run.trim())
    }
  }

  return parts.join('\n\n')
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
): string {
  const tokens = buildTokens(pkg, version, platform, prefix, buildDir, depPaths)
  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const archName = arch === 'arm64' ? 'aarch64' : 'x86-64'

  const sections: string[] = []

  // Shebang and safety
  sections.push('#!/bin/bash')
  sections.push('set -eo pipefail')
  sections.push('')

  // Default compiler flags (from brewkit's flags())
  // Set BEFORE recipe env so recipes can override if needed
  sections.push('# Default compiler flags')
  if (osName === 'darwin') {
    sections.push('export MACOSX_DEPLOYMENT_TARGET=11.0')
    sections.push(`export LDFLAGS="-Wl,-rpath,${prefix} \${LDFLAGS:-}"`)
  } else if (osName === 'linux' && archName === 'x86-64') {
    sections.push('export CFLAGS="-fPIC ${CFLAGS:-}"')
    sections.push('export CXXFLAGS="-fPIC ${CXXFLAGS:-}"')
    sections.push('export LDFLAGS="-pie ${LDFLAGS:-}"')
  }
  sections.push('')

  // Environment from YAML recipe (overrides defaults above)
  if (recipe.build?.env) {
    sections.push('# Environment from recipe')
    sections.push(expandEnv(recipe.build.env, platform, tokens))
    sections.push('')
  }

  // Common setup
  sections.push('# Common setup')
  sections.push('export FORCE_UNSAFE_CONFIGURE=1')
  sections.push(`export SRCROOT="${buildDir}"`)
  sections.push(`export HOME="${buildDir}/.home"`)
  sections.push('mkdir -p "$HOME"')
  sections.push('')

  // Add dependency paths to PATH and pkg-config
  const depBinPaths: string[] = []
  const depLibPaths: string[] = []
  const depIncludePaths: string[] = []
  const depPkgConfigPaths: string[] = []

  for (const [key, depPath] of Object.entries(depPaths)) {
    if (!key.startsWith('deps.')) continue
    depBinPaths.push(`${depPath}/bin`)
    depLibPaths.push(`${depPath}/lib`)
    depIncludePaths.push(`${depPath}/include`)
    depPkgConfigPaths.push(`${depPath}/lib/pkgconfig`)
  }

  if (depBinPaths.length > 0) {
    sections.push('# Dependency paths')
    sections.push(`export PATH="${depBinPaths.join(':')}:$PATH"`)
    sections.push(`export LIBRARY_PATH="${depLibPaths.join(':')}:\${LIBRARY_PATH:-}"`)
    sections.push(`export CPATH="${depIncludePaths.join(':')}:\${CPATH:-}"`)
    sections.push(`export PKG_CONFIG_PATH="${depPkgConfigPaths.join(':')}:\${PKG_CONFIG_PATH:-}"`)
    sections.push(`export LD_LIBRARY_PATH="${depLibPaths.join(':')}:\${LD_LIBRARY_PATH:-}"`)
    if (osName === 'darwin') {
      sections.push(`export DYLD_LIBRARY_PATH="${depLibPaths.join(':')}:\${DYLD_LIBRARY_PATH:-}"`)
    }
    sections.push('')
  }

  // Working directory
  const wd = recipe.build?.['working-directory']
  if (wd) {
    const expandedWd = applyTokens(wd, tokens)
    sections.push(`mkdir -p "${expandedWd}"`)
    sections.push(`cd "${expandedWd}"`)
  } else {
    sections.push(`cd "${buildDir}"`)
  }
  sections.push('')

  // User script from pantry YAML
  if (recipe.build?.script) {
    sections.push('# Build script from pantry recipe')
    sections.push(processScript(recipe.build.script, tokens, platform, version))
  } else {
    sections.push('echo "No build script found in recipe"')
    sections.push('exit 1')
  }

  return sections.join('\n')
}

/**
 * Get skip list from recipe
 */
export function getSkips(recipe: PackageRecipe): string[] {
  const skip = recipe.build?.skip
  if (!skip) return []
  if (typeof skip === 'string') return [skip]
  if (Array.isArray(skip)) return skip
  return []
}
