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

  // Default compiler flags (from brewkit's flags())
  // Set BEFORE recipe env so recipes can override if needed
  sections.push('# Default compiler flags')
  if (osName === 'darwin') {
    sections.push('export MACOSX_DEPLOYMENT_TARGET=11.0')
    sections.push(`export LDFLAGS="-Wl,-rpath,${prefix} \${LDFLAGS:-}"`)
  } else if (osName === 'linux' && archName === 'x86-64') {
    sections.push('export CFLAGS="-fPIC ${CFLAGS:-}"')
    sections.push('export CXXFLAGS="-fPIC ${CXXFLAGS:-}"')
    // Note: Do NOT add -pie to LDFLAGS — it breaks shared library builds
    // (causes "undefined reference to main" when linking .so files)
  }
  sections.push('')

  // Common setup — set BEFORE recipe env so recipes can override (e.g. certbot's SRCROOT)
  sections.push('# Common setup')
  sections.push('export FORCE_UNSAFE_CONFIGURE=1')
  sections.push(`export SRCROOT="${buildDir}"`)
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
  sections.push('')

  // Rust toolchain
  sections.push('# Rust toolchain')
  sections.push('if [ -d "$REAL_HOME/.cargo/bin" ]; then')
  sections.push('  export CARGO_HOME="$REAL_HOME/.cargo"')
  sections.push('  export RUSTUP_HOME="$REAL_HOME/.rustup"')
  sections.push('  export PATH="$CARGO_HOME/bin:$PATH"')
  sections.push('  # Symlink cargo/rustup into overridden $HOME so recipes using $HOME/.cargo/bin work')
  sections.push('  ln -sfn "$REAL_HOME/.cargo" "$HOME/.cargo" 2>/dev/null || true')
  sections.push('  ln -sfn "$REAL_HOME/.rustup" "$HOME/.rustup" 2>/dev/null || true')
  sections.push('elif [ -d "/usr/share/rust/.cargo/bin" ]; then')
  sections.push('  export PATH="/usr/share/rust/.cargo/bin:$PATH"')
  sections.push('elif command -v cargo &>/dev/null; then')
  sections.push('  # Cargo available via system PATH (e.g., Homebrew on macOS)')
  sections.push('  CARGO_BIN_DIR="$(dirname "$(command -v cargo)")"')
  sections.push('  export PATH="$CARGO_BIN_DIR:$PATH"')
  sections.push('fi')
  sections.push('')

  // Go toolchain — detect GOPATH but defer GOROOT until after deps are on PATH
  sections.push('# Go toolchain (GOPATH only; GOROOT set after deps)')
  sections.push('export GOPATH="$REAL_HOME/go"')
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

  // Wrap sed to handle nullglob (empty glob → no file args) and use GNU sed on macOS
  sections.push('# sed wrapper: use GNU sed on macOS + handle empty nullglob gracefully')
  sections.push('__real_sed="$(command -v gsed 2>/dev/null || command -v sed)"')
  sections.push('sed() {')
  // With -i flag, we need at least 3 args: sed -i 'pattern' file...
  // If only 2 args (no files due to nullglob), silently succeed
  sections.push('  if [ "$1" = "-i" ] && [ $# -le 2 ]; then return 0; fi')
  // Also handle sed -i -e 'pattern' with no files (3 args, no file)
  sections.push('  if [ "$1" = "-i" ] && [ "$2" = "-e" ] && [ $# -le 3 ]; then return 0; fi')
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
    sections.push('      if [ "$arg" = "-D" ]; then has_D=true; else args+=("$arg"); fi')
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
  sections.push("          printf '#!/bin/sh\\nSCRIPT_DIR=\"$(cd \"$(dirname \"$0\")\" && pwd)\"\\nexec \"$SCRIPT_DIR/../venv/bin/%s\" \"$@\"\\n' \"$cmd_name\" > \"$prefix/bin/$cmd_name\"")
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
  sections.push("    printf '#!/bin/sh\\nSCRIPT_DIR=\"$(cd \"$(dirname \"$0\")\" && pwd)\"\\nexec \"$SCRIPT_DIR/../venv/bin/%s\" \"$@\"\\n' \"$cmd_name\" > \"$target\"")
  sections.push('    chmod +x "$target"')
  sections.push('  fi')
  sections.push('}')
  // Do NOT export -f python-venv.sh: only called from our build script
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
  }

  // Also include system pkg-config paths so configure can find system-installed dev packages
  if (osName === 'linux') {
    depPkgConfigPaths.push('/usr/lib/x86_64-linux-gnu/pkgconfig')
    depPkgConfigPaths.push('/usr/lib/pkgconfig')
    depPkgConfigPaths.push('/usr/share/pkgconfig')
    depLibPaths.push('/usr/lib/x86_64-linux-gnu')
    depIncludePaths.push('/usr/include')
  } else if (osName === 'darwin') {
    depPkgConfigPaths.push('/opt/homebrew/lib/pkgconfig')
    depPkgConfigPaths.push('/usr/local/lib/pkgconfig')
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
    if (osName === 'darwin') {
      sections.push(`export DYLD_LIBRARY_PATH="${depLibPaths.join(':')}:\${DYLD_LIBRARY_PATH:-}"`)
    }
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
  sections.push('')

  // Working directory — always cd to buildDir first, then to any subdirectory
  sections.push(`cd "${buildDir}"`)
  const wd = recipe.build?.['working-directory']
  if (wd) {
    const expandedWd = applyTokens(wd, tokens)
    // If relative, it's a subdirectory of buildDir; if absolute, use as-is
    sections.push(`mkdir -p "${expandedWd}"`)
    sections.push(`cd "${expandedWd}"`)
  }
  sections.push('')

  // User script from pantry YAML
  // Handle both `build: { script: [...] }` and `build: [...]` (direct array) formats
  const buildScript = Array.isArray(recipe.build) ? recipe.build : recipe.build?.script
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
