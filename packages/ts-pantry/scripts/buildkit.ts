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
  _pkg: string,
  version: string,
  platform: string,
  prefix: string,
  buildDir: string,
  depPaths: Record<string, string>,
  versionTag?: string,
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
        const propContent = applyTokens(
          typeof item.prop === 'string' ? item.prop : String(item.prop.content || item.prop.contents || ''),
          tokens,
        )
        const extname = item.prop?.extname ? `.${item.prop.extname.replace(/^\./, '')}` : ''
        // Single-quoted heredoc (<<'EOF') prevents bash variable expansion,
        // so we do NOT need to escape $ — content is written literally.
        // Only escape backslashes that aren't already part of an escape sequence.
        run = [
          'OLD_PROP=$PROP',
          `PROP=$(mktemp)${extname}`,
          `cat <<'DEV_PKGX_EOF' > $PROP`,
          propContent,
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
  versionTag?: string,
): string {
  const tokens = buildTokens(pkg, version, platform, prefix, buildDir, depPaths, versionTag)
  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const archName = arch === 'arm64' ? 'aarch64' : 'x86-64'

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
    sections.push('export CFLAGS="-Wno-error=incompatible-function-pointer-types -Wno-error=int-conversion -Wno-error=implicit-function-declaration ${CFLAGS:-}"')
    sections.push('export CXXFLAGS="-Wno-error=incompatible-function-pointer-types ${CXXFLAGS:-}"')
  } else if (osName === 'linux' && archName === 'x86-64') {
    // Modern GCC/Clang treat certain warnings as errors (C23 defaults) — relax them
    // Note: -Wno-error=incompatible-function-pointer-types is Clang-only; GCC has
    // -Wno-error=incompatible-pointer-types instead (GCC errors on the Clang form)
    sections.push('export CFLAGS="-fPIC -Wno-error=implicit-function-declaration -Wno-error=int-conversion -Wno-error=incompatible-pointer-types ${CFLAGS:-}"')
    sections.push('export CXXFLAGS="-fPIC ${CXXFLAGS:-}"')
  }
  sections.push('')

  // Ensure Homebrew tools are available on macOS (glibtool, gsed, etc.)
  if (osName === 'darwin') {
    sections.push('# Ensure Homebrew paths are available on macOS')
    sections.push('case ":$PATH:" in *:/opt/homebrew/bin:*) ;; *) export PATH="/opt/homebrew/bin:$PATH" ;; esac')
    sections.push('case ":$PATH:" in *:/opt/homebrew/sbin:*) ;; *) export PATH="/opt/homebrew/sbin:$PATH" ;; esac')
    sections.push('')
  }

  // Common setup — set BEFORE recipe env so recipes can override (e.g. certbot's SRCROOT)
  sections.push('# Common setup')
  sections.push('export FORCE_UNSAFE_CONFIGURE=1')
  sections.push(`export SRCROOT="${buildDir}"`)
  // Fix CMake compatibility: modern CMake (3.27+) rejects cmake_minimum_required(VERSION < 3.5)
  // This env var tells CMake to accept older minimum versions (fixes vid.stab, qhull, soxr, etc.)
  sections.push('export CMAKE_POLICY_VERSION_MINIMUM=3.5')
  sections.push('')

  // Environment from YAML recipe (overrides defaults above)
  if (recipe.build?.env) {
    sections.push('# Environment from recipe')
    sections.push(expandEnv(recipe.build.env, platform, tokens))
    sections.push('')
  }

  // Preserve system toolchain paths before overriding HOME
  sections.push('# Preserve system toolchains before HOME override')
  sections.push('REAL_HOME="${HOME}"')
  sections.push(`export HOME="${buildDir}/.home"`)
  sections.push('mkdir -p "$HOME"')
  // Create an isolated .cargo/bin directory with individual symlinks.
  // This prevents recipes (e.g. fermyon.com/spin) from corrupting the shared cargo
  // installation when they write into $HOME/.cargo/bin/. By using a real directory
  // instead of a directory symlink, recipe modifications only affect our copy.
  sections.push('if [ -d "$REAL_HOME/.cargo" ]; then')
  sections.push('  mkdir -p "$HOME/.cargo/bin"')
  sections.push('  # Symlink individual binaries (not the directory) for isolation')
  sections.push('  for _f in "$REAL_HOME/.cargo/bin"/*; do')
  sections.push('    [ -e "$_f" ] && ln -sf "$_f" "$HOME/.cargo/bin/" 2>/dev/null || true')
  sections.push('  done')
  sections.push('  # Symlink other .cargo subdirs (registry, config, etc.) for cargo operations')
  sections.push('  for _d in "$REAL_HOME/.cargo"/*; do')
  sections.push('    case "$_d" in */bin) continue ;; esac')
  sections.push('    ln -sf "$_d" "$HOME/.cargo/" 2>/dev/null || true')
  sections.push('  done')
  sections.push('  # Isolate .rustup: copy settings but symlink toolchains (large, read-only-ish)')
  sections.push('  # This prevents `rustup default nightly` (e.g. dssim) from changing the')
  sections.push('  # shared default toolchain and corrupting subsequent builds in the batch.')
  sections.push('  if [ -d "$REAL_HOME/.rustup" ]; then')
  sections.push('    mkdir -p "$HOME/.rustup"')
  sections.push('    for _rd in "$REAL_HOME/.rustup"/*; do')
  sections.push('      case "$_rd" in')
  sections.push('        */settings.toml) cp "$_rd" "$HOME/.rustup/" 2>/dev/null || true ;;')
  sections.push('        *) ln -sf "$_rd" "$HOME/.rustup/" 2>/dev/null || true ;;')
  sections.push('      esac')
  sections.push('    done')
  sections.push('    export RUSTUP_HOME="$HOME/.rustup"')
  sections.push('  fi')
  sections.push('  export CARGO_HOME="$REAL_HOME/.cargo"')
  sections.push('fi')
  sections.push('')

  // Rust toolchain — unconditionally add all known cargo directories to PATH.
  // Previous approach (sourcing .cargo/env + [ -f ] tests) failed on GitHub Actions
  // because the env script uses $HOME which we've overridden, and file tests can fail
  // on rustup proxy binaries. Instead, just add every existing cargo bin dir to PATH.
  sections.push('# Rust toolchain — add all known cargo bin directories to PATH')
  sections.push('_cargo_found=false')
  sections.push('for _cargo_dir in "$REAL_HOME/.cargo/bin" "/usr/share/rust/.cargo/bin" "/opt/homebrew/bin" "/usr/local/bin"; do')
  sections.push('  if [ -d "$_cargo_dir" ] && ls "$_cargo_dir"/cargo* &>/dev/null; then')
  sections.push('    export PATH="$_cargo_dir:$PATH"')
  sections.push('    _cargo_found=true')
  sections.push('  fi')
  sections.push('done')
  sections.push('if ! $_cargo_found && command -v cargo &>/dev/null; then')
  sections.push('  CARGO_BIN_DIR="$(dirname "$(command -v cargo)")"')
  sections.push('  export PATH="$CARGO_BIN_DIR:$PATH"')
  sections.push('  _cargo_found=true')
  sections.push('fi')
  sections.push('echo "[buildkit] Rust: cargo=$(command -v cargo 2>/dev/null || echo NOT_FOUND), REAL_HOME=$REAL_HOME, _cargo_found=$_cargo_found"')
  sections.push('')

  // Go toolchain — set default GOPATH only if recipe didn't already set it
  const recipeEnv = recipe.build?.env ? platformReduce(recipe.build.env, platform) : {}
  sections.push('# Go toolchain (GOPATH default; GOROOT set after deps)')
  if (!recipeEnv.GOPATH) {
    sections.push('export GOPATH="$REAL_HOME/go"')
  }
  sections.push('mkdir -p "$GOPATH"')
  sections.push('')

  // Java/JDK — preserve JAVA_HOME from environment (GitHub runners have Java pre-installed)
  sections.push('# Java toolchain')
  sections.push('if [ -z "$JAVA_HOME" ] && [ -d "/usr/lib/jvm" ]; then')
  sections.push('  # Auto-detect JDK on Linux')
  sections.push('  for d in /usr/lib/jvm/java-*-openjdk-*; do')
  sections.push('    if [ -d "$d" ]; then export JAVA_HOME="$d"; break; fi')
  sections.push('  done')
  sections.push('fi')
  if (osName === 'darwin') {
    sections.push('if [ -z "$JAVA_HOME" ] && /usr/libexec/java_home &>/dev/null; then')
    sections.push('  export JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null || true)"')
    sections.push('fi')
  }
  sections.push('if [ -n "$JAVA_HOME" ]; then')
  sections.push('  export PATH="$JAVA_HOME/bin:$PATH"')
  sections.push('fi')
  sections.push('')

  // Node.js / npm
  sections.push('# Node.js')
  sections.push('if [ -d "$REAL_HOME/.nvm" ]; then')
  sections.push('  export NVM_DIR="$REAL_HOME/.nvm"')
  sections.push('fi')
  sections.push('')

  // Python: make system dist-packages visible to S3-downloaded Python
  // (e.g., python3-libxml2, python3-lxml installed via apt are in /usr/lib/python3/dist-packages)
  if (osName === 'linux') {
    sections.push('# Include system Python dist-packages so S3 Python can find system modules')
    sections.push('for _pydir in /usr/lib/python3/dist-packages /usr/lib/python3.*/dist-packages; do')
    sections.push('  if [ -d "$_pydir" ]; then')
    sections.push('    export PYTHONPATH="${PYTHONPATH:+$PYTHONPATH:}$_pydir"')
    sections.push('  fi')
    sections.push('done')
    sections.push('')
  }

  // pip: avoid permission errors with system Python on Linux
  sections.push('# pip: avoid permission errors when system Python is externally-managed')
  sections.push('export PIP_BREAK_SYSTEM_PACKAGES=1')
  sections.push('export PIP_IGNORE_INSTALLED=1')
  sections.push('')

  // Linux multiarch: ensure linker can find libs in /usr/lib/x86_64-linux-gnu
  if (osName === 'linux') {
    sections.push('# Multiarch library paths (Debian/Ubuntu)')
    sections.push('if [ -d "/usr/lib/x86_64-linux-gnu" ]; then')
    sections.push('  export LIBRARY_PATH="/usr/lib/x86_64-linux-gnu:${LIBRARY_PATH:-}"')
    sections.push('fi')
    sections.push('')
  }

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
  sections.push('      local prefix="$1" ver="$2"')
  sections.push('      python3 -m venv "$prefix/venv"')
  sections.push('      "$prefix/venv/bin/pip" install --upgrade pip setuptools wheel 2>/dev/null || true')
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
  sections.push('          printf \'#!/bin/sh\\nSCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"\\nexec "$SCRIPT_DIR/../venv/bin/%s" "$@"\\n\' "$cmd_name" > "$prefix/bin/$cmd_name"')
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
  sections.push('  "$prefix/venv/bin/pip" install --upgrade pip setuptools wheel 2>/dev/null || true')
  // cd to SRCROOT if set — some recipes point SRCROOT to a subdirectory (e.g., certbot)
  sections.push('  local _pip_dir="."')
  sections.push('  if [ -n "$SRCROOT" ] && [ -d "$SRCROOT" ]; then _pip_dir="$SRCROOT"; fi')
  sections.push('  "$prefix/venv/bin/pip" install "$_pip_dir"')
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
  sections.push('"$prefix/venv/bin/pip" install --upgrade pip setuptools wheel 2>/dev/null || true')
  sections.push('_pip_dir="."')
  sections.push('if [ -n "$SRCROOT" ] && [ -d "$SRCROOT" ]; then _pip_dir="$SRCROOT"; fi')
  sections.push('"$prefix/venv/bin/pip" install "$_pip_dir"')
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
  const depPkgConfigPaths: string[] = []

  for (const [key, depPath] of Object.entries(depPaths)) {
    // Only use .prefix keys for PATH construction (skip .version, .version.major, etc.)
    if (!key.endsWith('.prefix')) continue
    depBinPaths.push(`${depPath}/bin`)
    depLibPaths.push(`${depPath}/lib`)
    depIncludePaths.push(`${depPath}/include`)
    depPkgConfigPaths.push(`${depPath}/lib/pkgconfig`)
    depPkgConfigPaths.push(`${depPath}/share/pkgconfig`)
  }

  // Also include system pkg-config paths so configure can find system-installed dev packages
  if (osName === 'linux') {
    depPkgConfigPaths.push('/usr/lib/x86_64-linux-gnu/pkgconfig')
    depPkgConfigPaths.push('/usr/lib/pkgconfig')
    depPkgConfigPaths.push('/usr/share/pkgconfig')
    depLibPaths.push('/usr/lib/x86_64-linux-gnu')
    // NOTE: Do NOT add /usr/include to depIncludePaths. It's already in GCC's
    // default search path, and adding it to CPATH causes CMake to emit
    // -isystem /usr/include, which changes header search order and breaks
    // GCC's #include_next <stdlib.h> in C++ standard library headers.
  } else if (osName === 'darwin') {
    depPkgConfigPaths.push('/opt/homebrew/lib/pkgconfig')
    depPkgConfigPaths.push('/opt/homebrew/share/pkgconfig')
    depPkgConfigPaths.push('/usr/local/lib/pkgconfig')
    depPkgConfigPaths.push('/usr/local/share/pkgconfig')
    depIncludePaths.push('/opt/homebrew/include')
    depLibPaths.push('/opt/homebrew/lib')
  }

  if (depBinPaths.length > 0 || depPkgConfigPaths.length > 0) {
    sections.push('# Dependency paths')
    if (depBinPaths.length > 0) {
      sections.push(`export PATH="${depBinPaths.join(':')}:$PATH"`)
    }
    sections.push(`export LIBRARY_PATH="${depLibPaths.join(':')}:\${LIBRARY_PATH:-}"`)
    sections.push(`export CPATH="${depIncludePaths.join(':')}:\${CPATH:-}"`)
    sections.push(`export PKG_CONFIG_PATH="${depPkgConfigPaths.join(':')}:\${PKG_CONFIG_PATH:-}"`)
    sections.push(`export LD_LIBRARY_PATH="${depLibPaths.join(':')}:\${LD_LIBRARY_PATH:-}"`)
    if (osName === 'linux') {
      // On Linux, LD_LIBRARY_PATH is searched BEFORE default locations. If any S3 dep
      // ships a libcurl without HTTP/2 support, cargo picks it up and fails with
      // "failed to enable HTTP/2, is curl not built right?". Disable HTTP/2 multiplexing
      // for cargo to avoid this. Also save the original LD_LIBRARY_PATH so cargo can
      // use system libraries for network operations.
      sections.push('export _BUILDKIT_ORIG_LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}"')
      sections.push('export CARGO_HTTP_MULTIPLEXING=false')
    }
    if (osName === 'darwin') {
      // Create stub pkg-config files for system libraries that lack them on macOS.
      // S3-built freetype2.pc requires bzip2, but macOS system bzip2 has no .pc file.
      sections.push('_bk_pc="/tmp/buildkit-pkgconfig"')
      sections.push('mkdir -p "$_bk_pc"')
      sections.push('if ! pkg-config --exists bzip2 2>/dev/null; then')
      sections.push('  _sdk="$(xcrun --show-sdk-path 2>/dev/null || echo /usr)"')
      sections.push('  cat > "$_bk_pc/bzip2.pc" << BZIP2PC')
      sections.push('prefix=/usr')
      sections.push('libdir=\\${prefix}/lib')
      sections.push('includedir=${_sdk}/usr/include')
      sections.push('')
      sections.push('Name: bzip2')
      sections.push('Description: bzip2 compression library')
      sections.push('Version: 1.0.8')
      sections.push('Libs: -lbz2')
      sections.push('Cflags: -I\\${includedir}')
      sections.push('BZIP2PC')
      sections.push('fi')
      sections.push('export PKG_CONFIG_PATH="$_bk_pc:${PKG_CONFIG_PATH:-}"')
      sections.push('')

      // Use DYLD_FALLBACK_LIBRARY_PATH instead of DYLD_LIBRARY_PATH on macOS.
      // DYLD_LIBRARY_PATH is searched BEFORE default locations (including @rpath),
      // which breaks programs like the JVM that load native libraries from their own
      // directories (causes UnsatisfiedLinkError: Inflater.initIDs()).
      // DYLD_FALLBACK_LIBRARY_PATH is searched AFTER default locations, so it helps
      // builds find dependency libraries without interfering with system tools.
      sections.push(`export DYLD_FALLBACK_LIBRARY_PATH="${depLibPaths.join(':')}:\${DYLD_FALLBACK_LIBRARY_PATH:-}"`)
    }

    // CMAKE_PREFIX_PATH: help CMake find deps (ported from brewkit)
    const depPrefixes = Object.entries(depPaths)
      .filter(([k]) => k.endsWith('.prefix'))
      .map(([, v]) => v)
    if (depPrefixes.length > 0) {
      sections.push(`export CMAKE_PREFIX_PATH="${depPrefixes.join(':')}:\${CMAKE_PREFIX_PATH:-}"`)
    }

    // Create compat symlinks for stale /tmp/buildkit-install-* paths in pre-built deps (darwin only).
    // S3-built binaries may have hardcoded dylib references to their original build-time
    // install prefix (e.g., /tmp/buildkit-install-curl.se/lib/libcurl.4.dylib). When such
    // a binary is later used as a dependency, that install prefix doesn't exist. Create
    // symlinks from the stale install-prefix to the actual dep location so dyld resolves them.
    if (osName === 'darwin' && depPrefixes.length > 0) {
      sections.push('# Create compat symlinks for stale /tmp/buildkit-install-* dylib paths')
      sections.push('for _dep_prefix in ' + depPrefixes.map(p => `"${p}"`).join(' ') + '; do')
      sections.push('  [ -d "$_dep_prefix" ] || continue')
      sections.push('  case "$_dep_prefix" in /tmp/buildkit-deps/*) ;; *) continue ;; esac')
      sections.push('  _domain_with_ver="${_dep_prefix#/tmp/buildkit-deps/}"')
      sections.push('  _domain="${_domain_with_ver%/*}"')
      sections.push('  _safe_domain="$(echo "$_domain" | tr \'/\' \'-\')"')
      sections.push('  _compat="/tmp/buildkit-install-${_safe_domain}"')
      sections.push('  if [ ! -e "$_compat" ]; then')
      sections.push('    ln -sf "$_dep_prefix" "$_compat"')
      sections.push('  fi')
      sections.push('done')
    }
    // NOTE: system cmake scrubbing for /usr/include removed — the compiler wrapper
    // (cc/c++/gcc/g++) now strips -isystem /usr/include directly from compiler args,
    // which catches dynamically-computed paths (e.g. gflags computes /usr/include from its
    // install prefix at cmake configure time, so string replacement in .cmake files can't catch it).

    sections.push('')

    // Scrub stale/non-existent paths from dep cmake config files.
    // S3-built deps may have hardcoded paths in INTERFACE_INCLUDE_DIRECTORIES
    // that don't exist on the current runner, causing CMake errors or -isystem issues:
    // - /usr/include → breaks GCC #include_next on Linux
    // - /usr/local/include/x86_64-linux-gnu → doesn't exist on runners
    // - Xcode SDK paths from different macOS versions
    if (depPrefixes.length > 0) {
      const sdkFixInit = osName === 'darwin'
        ? `\nsdk = os.popen("xcrun --show-sdk-path 2>/dev/null").read().strip()`
        : ''
      const sdkFixLine = osName === 'darwin'
        ? `\n            if sdk: t = re.sub(r'/Applications/Xcode[^;"]*?/SDKs/MacOSX[^;"]*?\\.sdk', sdk, t)`
        : ''
      sections.push('# Scrub non-existent paths from dep cmake configs (only /tmp buildkit deps)')
      sections.push(`python3 << 'SCRUB_CMAKE_EOF'`)
      sections.push(`import os, re, sys, glob
# System include paths that break builds when used with -isystem (GCC #include_next)
BAD_INCLUDES = {"/usr/include", "/usr/local/include"}
dirs = [${depPrefixes.map(p => `"${p}"`).join(', ')}]
print(f"[cmake-scrub] scanning {len(dirs)} dep dirs", file=sys.stderr)
modified = 0
_isdir_cache = {}
def cached_isdir(p):
    if p not in _isdir_cache:
        _isdir_cache[p] = os.path.isdir(p)
    return _isdir_cache[p]${sdkFixInit}
for d in dirs:
    if not d.startswith("/tmp"):
        continue
    # Only search lib/cmake/ and share/cmake/ — cmake config files live here, not in bin/include/etc.
    files = []
    for sub in ("lib/cmake", "share/cmake", "lib64/cmake"):
        sub_dir = os.path.join(d, sub)
        if os.path.isdir(sub_dir):
            files.extend(glob.glob(os.path.join(sub_dir, "**", "*.cmake"), recursive=True))
    if not files:
        continue
    for f in files:
        try:
            t = open(f).read()
            orig = t
            # 1. Fix semicolon-separated path lists (INTERFACE_INCLUDE_DIRECTORIES, etc.)
            def fix_pathlist(m):
                paths = m.group(1).split(";")
                kept = [p for p in paths if not p.strip() or p.strip().startswith("$") or p.strip().startswith("@") or (p.strip() not in BAD_INCLUDES and cached_isdir(p.strip()))]
                return m.group(0).replace(m.group(1), ";".join(kept))
            t = re.sub(r'INTERFACE_INCLUDE_DIRECTORIES\\s+"([^"]+)"', fix_pathlist, t)
            t = re.sub(r'INTERFACE_LINK_DIRECTORIES\\s+"([^"]+)"', fix_pathlist, t)
            # 2. Fix standalone path assignments (e.g. set(gflags_INCLUDE_DIR "/usr/include"))
            # These cmake config variables feed into find_package() and end up as -isystem
            for bad in BAD_INCLUDES:
                # Replace standalone bad path in quotes: "/usr/include" → ""
                t = t.replace(f'"{bad}"', '""')
                # Remove bad path from semicolon lists: "...;/usr/include;..." → "...;..."
                t = t.replace(f';{bad};', ';')
                t = t.replace(f';{bad}"', '"')
                t = t.replace(f'"{bad};', '"')${sdkFixLine}
            if t != orig:
                open(f, "w").write(t)
                modified += 1
                print(f"[cmake-scrub] modified: {os.path.relpath(f, d)}", file=sys.stderr)
        except Exception as e:
            print(f"[cmake-scrub] ERROR {f}: {e}", file=sys.stderr)
print(f"[cmake-scrub] done: {modified} files modified", file=sys.stderr)`)
      sections.push('SCRUB_CMAKE_EOF')
      sections.push('')
    }

    if (osName === 'linux' && depPrefixes.length > 0) {
      // On Linux, S3-built deps (e.g. folly) may have cmake configs with hardcoded system
      // library paths. When buildkit-deps provide a newer version of specific libraries known
      // to have ABI mismatches with Ubuntu system versions, overwrite the system .so files.
      // Only target specific libraries to avoid breaking system tools.
      sections.push('# Overwrite specific system libs with buildkit versions (ABI mismatch fix)')
      sections.push(`sudo python3 << 'SYSLIB_OVERRIDE_EOF'
import os, shutil, sys
# Only override libraries known to have ABI mismatches between system and buildkit
# glog: Ubuntu has 0.6.0, buildkit has 0.7.1 (google::logging::internal namespace changes)
# gflags: Ubuntu has 2.2.2, buildkit has 2.3.0
ALLOW_OVERRIDE = {"libglog", "libgflags"}
SYS_LIB = "/usr/lib/x86_64-linux-gnu"
if not os.path.isdir(SYS_LIB):
    sys.exit(0)
deps = [${depPrefixes.map(p => `"${p}"`).join(', ')}]
overwritten = 0
for d in deps:
    if not d.startswith("/tmp"): continue
    lib_dir = os.path.join(d, "lib")
    if not os.path.isdir(lib_dir): continue
    for f in os.listdir(lib_dir):
        if not (f.endswith(".so") or ".so." in f): continue
        # Check if this library basename matches any in the allow list
        base = f.split(".so")[0]
        if base not in ALLOW_OVERRIDE: continue
        dep_lib = os.path.join(lib_dir, f)
        sys_lib = os.path.join(SYS_LIB, f)
        if os.path.exists(sys_lib) and os.path.isfile(dep_lib):
            try:
                shutil.copy2(dep_lib, sys_lib)
                overwritten += 1
                print(f"[syslib-override] {f}: {dep_lib} -> {sys_lib}", file=sys.stderr)
            except: pass
if overwritten:
    os.system("ldconfig 2>/dev/null")
SYSLIB_OVERRIDE_EOF`)
      sections.push('')
    }
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
  sections.push('    real_cc="$(command -v "$cc_name" 2>/dev/null || true)"')
  sections.push('    [ -n "$real_cc" ] || continue')
  // Use single-quoted heredoc (<<'CCEOF') to prevent shell expansion.
  // Embed the real compiler path via sed replacement after writing.
  sections.push('    cat > "$wrapper_dir/$cc_name" <<\'CCEOF\'')
  sections.push('#!/bin/bash')
  sections.push('args=()')
  sections.push('has_shared=false')
  sections.push('for arg in "$@"; do')
  sections.push('  case "$arg" in')
  sections.push('    -Werror|-Werror=*) continue ;;  # filter -Werror (brewkit shim)')
  sections.push('    -force_cpusubtype_ALL|-Wl,-force_cpusubtype_ALL) continue ;;  # obsolete Apple linker flag')
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
  // GCC specs workaround: if ./specs is a directory, run GCC from /tmp
  // to prevent "fatal error: cannot read spec file './specs': Is a directory"
  // We convert relative file paths to absolute so GCC can still find them.
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
  sections.push('  __REAL_CC__ "${_final_args[@]}"')
  sections.push('  _rc=$?')
  sections.push('  cd "$_orig_cwd"')
  sections.push('  exit $_rc')
  sections.push('fi')
  sections.push('exec __REAL_CC__ "${args[@]}"')
  sections.push('CCEOF')
  // Replace __REAL_CC__ placeholder with the actual compiler path
  // Use perl for portable in-place edit (sed -i syntax differs on macOS vs Linux)
  sections.push('    perl -pi -e "s|__REAL_CC__|$real_cc|g" "$wrapper_dir/$cc_name"')
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
    sections.push('# Homebrew installs GNU libtool as glibtool at /opt/homebrew/bin/glibtool')
    sections.push('# Check there first, then fall back to symlinking from libtool if it is GNU.')
    sections.push('if ! command -v glibtool &>/dev/null; then')
    sections.push('  if [ -x /opt/homebrew/bin/glibtool ]; then')
    sections.push('    ln -sf /opt/homebrew/bin/glibtool "${TMPDIR:-/tmp}/_cc_wrapper/glibtool" 2>/dev/null || true')
    sections.push('  elif command -v libtool &>/dev/null; then')
    sections.push('    _lt="$(command -v libtool)"')
    sections.push('    if "$_lt" --version 2>/dev/null | head -1 | grep -qi "GNU\\|libtool"; then')
    sections.push('      ln -sf "$_lt" "${TMPDIR:-/tmp}/_cc_wrapper/glibtool" 2>/dev/null || true')
    sections.push('    fi')
    sections.push('  fi')
    sections.push('fi')
    sections.push('if ! command -v glibtoolize &>/dev/null; then')
    sections.push('  if [ -x /opt/homebrew/bin/glibtoolize ]; then')
    sections.push('    ln -sf /opt/homebrew/bin/glibtoolize "${TMPDIR:-/tmp}/_cc_wrapper/glibtoolize" 2>/dev/null || true')
    sections.push('  elif command -v libtoolize &>/dev/null; then')
    sections.push('    ln -sf "$(command -v libtoolize)" "${TMPDIR:-/tmp}/_cc_wrapper/glibtoolize" 2>/dev/null || true')
    sections.push('  fi')
    sections.push('fi')
    sections.push('')
  }

  // Now set GOROOT from whichever `go` binary is first on PATH (deps or system)
  // This must come AFTER dep paths are added to avoid GOROOT/go version mismatch
  sections.push('# Set GOROOT from the go binary now on PATH (after deps)')
  // Check if go.dev is a dep — use its directory directly as GOROOT
  const goDevPrefix = depPaths['deps.go.dev.prefix']
  if (goDevPrefix) {
    sections.push(`if [ -x "${goDevPrefix}/bin/go" ]; then`)
    sections.push(`  export GOROOT="${goDevPrefix}"`)
    sections.push('elif command -v go &>/dev/null; then')
    sections.push('  export GOROOT="$(go env GOROOT 2>/dev/null || true)"')
    sections.push('fi')
  } else {
    sections.push('if command -v go &>/dev/null; then')
    sections.push('  export GOROOT="$(go env GOROOT 2>/dev/null || true)"')
    sections.push('fi')
  }
  sections.push('export PATH="$GOPATH/bin:${GOROOT:+$GOROOT/bin:}$PATH"')
  // Allow Go to auto-download the correct toolchain version per go.mod
  // This fixes packages that use //go:linkname with internal APIs broken in newer Go
  sections.push('export GOTOOLCHAIN=auto')
  sections.push('')

  // Working directory — always cd to buildDir first, then to any subdirectory
  sections.push(`cd "${buildDir}"`)
  const wd = recipe.build?.['working-directory']
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

  // Ensure cargo/go/etc are reachable — clear bash hash table and force PATH update
  // Bash caches "command not found" results in its hash table. If any command lookup
  // failed earlier (e.g. cargo checked before PATH was set up), bash remembers the
  // failure even after PATH is updated. `hash -r` clears this cache.
  sections.push('# Clear bash command hash table and ensure toolchains are in PATH')
  sections.push('hash -r 2>/dev/null || true')
  sections.push('# Re-add cargo dirs to PATH (hash table may have cached "not found")')
  sections.push('for _cdir in "$REAL_HOME/.cargo/bin" "/usr/share/rust/.cargo/bin" "/opt/homebrew/bin" "/usr/local/bin"; do')
  sections.push('  if [ -d "$_cdir" ] && ls "$_cdir"/cargo* &>/dev/null; then')
  sections.push('    case ":$PATH:" in *:"$_cdir":*) ;; *) export PATH="$_cdir:$PATH" ;; esac')
  sections.push('  fi')
  sections.push('done')
  sections.push('')
  // Final check: if cargo still not found, try to find it anywhere.
  // Use `|| true` to prevent SIGPIPE from `find|head` crashing with `set -eo pipefail`.
  sections.push('if ! command -v cargo &>/dev/null; then')
  sections.push('  echo "[buildkit] WARN: cargo not found in PATH before user script" >&2')
  sections.push('  # Last resort: try to find cargo anywhere and add it')
  sections.push('  _found_cargo="$(find "$REAL_HOME/.cargo" /usr/local/bin /usr/bin -name cargo -type f 2>/dev/null | head -1 || true)"')
  sections.push('  if [ -n "$_found_cargo" ]; then')
  sections.push('    echo "[buildkit] Found cargo at $_found_cargo, adding to PATH" >&2')
  sections.push('    export PATH="$(dirname "$_found_cargo"):$PATH"')
  sections.push('    hash -r 2>/dev/null || true')
  sections.push('  fi')
  sections.push('fi')
  sections.push('')

  // Python environment fix: on Debian/Ubuntu, /usr/lib/python3/dist-packages/ contains
  // Debian-patched setuptools/wheel with install_layout that breaks standard wheel builds:
  //   AttributeError: install_layout. Did you mean: 'install_platlib'?
  // pip install --upgrade installs to a LOWER priority sys.path entry, so the patched
  // versions still take precedence. We must remove the Debian-patched files and replace.
  // Also ensure `python` resolves to our python3 (recipes often use bare `python`).
  sections.push('# Python environment setup')
  sections.push('if command -v python3 &>/dev/null; then')
  // Ensure `python` command resolves to our python3 (many recipes use bare `python`)
  sections.push('  if ! command -v python &>/dev/null; then')
  sections.push('    ln -sf "$(command -v python3)" "${TMPDIR:-/tmp}/_cc_wrapper/python" 2>/dev/null || true')
  sections.push('  fi')
  // Remove Debian-patched setuptools/wheel that cause install_layout errors
  // These sit at /usr/lib/python3/dist-packages/ which has HIGHER priority than
  // where pip install --upgrade puts new versions
  sections.push('  if [ -f /usr/lib/python3/dist-packages/wheel/__init__.py ]; then')
  sections.push('    sudo rm -rf /usr/lib/python3/dist-packages/setuptools* \\')
  sections.push('                /usr/lib/python3/dist-packages/wheel* \\')
  sections.push('                /usr/lib/python3/dist-packages/pkg_resources* \\')
  sections.push('                /usr/lib/python3/dist-packages/_distutils_hack* 2>/dev/null || true')
  sections.push('    python3 -m pip install --break-system-packages setuptools wheel 2>/dev/null || true')
  sections.push('  fi')
  sections.push('fi')
  sections.push('')

  // User script from pantry YAML
  // Handle `build: { script: [...] }`, `build: [...]` (direct array), and `build: "cmd"` (string) formats
  const buildScript = typeof recipe.build === 'string' ? [recipe.build] : Array.isArray(recipe.build) ? recipe.build : recipe.build?.script
  if (buildScript) {
    sections.push('# Build script from pantry recipe')
    sections.push(processScript(buildScript, tokens, platform, version))
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
