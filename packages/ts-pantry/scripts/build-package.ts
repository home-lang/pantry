#!/usr/bin/env bun

// Build Package from Source
// Reads package metadata from src/packages and build instructions from src/recipes
// Uses buildkit to generate bash build scripts from YAML recipes (like brewkit)

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { generateBuildScript, getSkips, type PackageRecipe, type NormalizedRecipe, type RecipeScriptStep, type RecipeTest } from './buildkit.ts'
import { fixUp } from './fix-up.ts'
import { selectPublishedFiles, writeProgramInterfaces } from './published-files'
import type { RuntimePackage } from './native-runtime'
import { reportBuild } from './report-build.ts'
import { persistBuildDiagnostics, sanitizeBuildDiagnostic } from './build-diagnostics.ts'
import { compareInstallerVersionsDesc, parseInstallerConstraint, satisfiesInstallerConstraint } from '../src/installer'
// package-overrides.ts removed — all build logic now in src/recipes/*.ts
type ScriptStep = string | { run: string, 'working-directory'?: string, if?: string }
const packageOverrides: Record<string, any> = {} // stub — overrides migrated to recipes

// Import package metadata
import { fileURLToPath } from 'node:url'
const packagesPath = fileURLToPath(new URL('../src/packages/index.ts', import.meta.url))
// eslint-disable-next-line ts/no-top-level-await
const { pantry } = await import(packagesPath)

// Build reverse domain→key map for packages with collision-resolved keys
// (e.g. x.org/protocol/xcb → xorgprotocol1, not xorgprotocolxcb)
const _pantryDomainMap = new Map<string, string>()
for (const [key, val] of Object.entries(pantry as Record<string, any>)) {
  if (val && typeof val === 'object' && typeof val.domain === 'string') {
    _pantryDomainMap.set(val.domain, key)
  }
}

function lookupPantryPackage(domain: string): any {
  const directKey = domainToKey(domain)
  const direct = (pantry as Record<string, any>)[directKey]
  if (direct?.versions) return direct
  const mappedKey = _pantryDomainMap.get(domain)
  if (mappedKey) return (pantry as Record<string, any>)[mappedKey]
  return null
}

// Parse YAML using Bun's built-in YAML parser (spec-compliant, written in Zig)
function parseYaml(content: string): Record<string, any> {
  return Bun.YAML.parse(content) as Record<string, any>
}

interface BuildOptions {
  package: string
  version: string
  platform: string
  buildDir: string
  prefix: string
  depsDir?: string
  bucket?: string
  region?: string
}

// PackageRecipe is imported from ./buildkit.ts (line 11)

// Template variable interpolation
function interpolate(template: string | any, vars: Record<string, string>): string {
  if (typeof template !== 'string') {
    return String(template)
  }
  return template
    // Handle ${{key}} first (before {{key}} to avoid partial matches)
    .replace(/\$\{\{([^}]+)\}\}/g, (_, key) => {
      const trimmedKey = key.trim()
      return vars[trimmedKey] ?? `\${{${trimmedKey}}}`
    })
    // Handle {{key}}
    .replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const trimmedKey = key.trim()
      return vars[trimmedKey] ?? `{{${trimmedKey}}}`
    })
    // Handle $ENV_VAR style
    .replace(/\$([A-Z_][A-Z0-9_]*)/g, (_, key) => {
      return process.env[key] ?? vars[key] ?? `\$${key}`
    })
}

/**
 * Determine version.tag from the YAML versions.strip pattern (fast heuristic).
 * In pkgx, version.tag = the original git tag before strip was applied.
 * Default github strip is /^v/ (removes v prefix from tags like v1.0.0)
 * But if tag doesn't have v prefix, version = tag (strip is no-op)
 */
function determineVersionTag(yamlContent: string, version: string): string {
  // Look for explicit strip pattern in the YAML
  // Match from first / to last / on the line (handles / inside pattern like /(cli/v|...)/
  const stripMatch = yamlContent.match(/strip:\s*\/(.+)\/$/)
  const stripMatchML = stripMatch ?? yamlContent.match(/strip:\s*\/(.+)\//)
  if (stripMatchML) {
    const pattern = stripMatchML[1]

    // Handle alternation patterns like (cli/v|@biomejs/biome@)
    // Extract the first alternative as the prefix to prepend
    if (pattern.includes('|')) {
      const alts = pattern.replace(/^\(/, '').replace(/\)$/, '').split('|')
      // Use first alternative, strip leading ^
      const prefix = alts[0].replace(/^\^/, '')
      return prefix + version
    }

    // Simple prefix pattern: /^v/, /^hdf5_/, /^mysql-/
    const simplePrefix = pattern.replace(/^\^/, '')
    if (simplePrefix === 'v') return `v${version}`
    return simplePrefix + version
  }

  // No explicit strip — check if this is a github source (default strip is /^v/)
  // But we need to handle cases where tags don't have v prefix
  // Heuristic: date-based versions (YYYYMMDD...) rarely have v prefix
  if (/^\d{6,}/.test(version)) return version

  // Default: assume v prefix (most common for github releases)
  return `v${version}`
}

/**
 * Resolve the actual GitHub tag for a version by querying the GitHub API.
 * This handles cases where version normalization loses information (leading zeros, etc).
 *
 * For example: version "2026.2.9.0" might map to tag "v2026.02.09.00" on GitHub.
 * The heuristic determineVersionTag() can't recover this, but the API can.
 *
 * Returns { tag, rawVersion } or null if no match found.
 */
async function resolveGitHubTag(yamlContent: string, version: string, distUrl = ''): Promise<{ tag: string, rawVersion: string } | null> {
  // Extract GitHub repo from the YAML versions section, OR — for native TS recipes
  // (no YAML) — from a github.com distributable URL. Without this, native recipes that
  // use {{version.tag}} (re2, cloc, p7zip, …) never resolve their real tag and 404 on
  // zero-padded / date-style tags (e.g. catalog 2025.8.5 vs real tag 2025-08-05).
  const ghMatch = yamlContent.match(/github:\s*([^\s#]+)/)
  let repo: string
  if (ghMatch) {
    // Strip /tags suffix if present (used for tag-based discovery like vim/vim/tags)
    repo = ghMatch[1].trim().replace(/\/tags$/, '').replace(/\/releases$/, '')
  }
  else {
    const urlMatch = distUrl.match(/github\.com\/([^/]+\/[^/]+?)(?:\/|\.git|$)/)
    if (!urlMatch) return null
    repo = urlMatch[1]
  }

  // Extract strip pattern (defaults to /^v/ for github sources)
  // Handle multi-line strip format (e.g. strip:\n  - /^release-/)
  let stripRegex: RegExp = /^v/
  const stripInlineMatch = yamlContent.match(/strip:\s*\/(.+)\//)
  const stripArrayMatch = yamlContent.match(/strip:\s*\n\s+-\s*\/(.+)\//)
  if (stripInlineMatch) {
    stripRegex = new RegExp(stripInlineMatch[1])
  }
else if (stripArrayMatch) {
    stripRegex = new RegExp(stripArrayMatch[1])
  }

  // Extract transform function if present (e.g. transform: v => v.replace('-', '.'))
  let transformFn: ((_v: string) => string | undefined) | null = null
  const transformMatch = yamlContent.match(/transform:\s*['"]?([^\n'"]+)['"]?$/m)
  if (transformMatch) {
    try {
      // eslint-disable-next-line no-new-func
      transformFn = new Function(`return (${transformMatch[1].trim()})`)() as any
    }
catch { /* ignore parse errors — fall back to no transform */ }
  }

  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
  if (token) headers.Authorization = `token ${token}`

  // Normalize a version string: strip leading zeros from each purely numeric component
  // e.g. "17.05" → "17.5", "2025.02.0" → "2025.2.0"
  // Does NOT truncate components containing non-digit chars (e.g. "2025-11-05" stays as-is)
  function normalizeVersion(v: string): string {
    return v.split('.').map(c => {
      if (/^\d+$/.test(c)) {
        return String(Number.parseInt(c, 10))
      }
      return c
    }).join('.')
  }

  // Compare two versions, accounting for trailing .0 differences
  // e.g. "20260107.1" matches "20260107.1.0" and "20260107.1.0.0"
  function versionsMatch(tagVersion: string, targetVersion: string): boolean {
    if (tagVersion === targetVersion) return true
    // Strip trailing .0 components from both and compare
    const stripTrailingZeros = (v: string) => v.replace(/(?:\.0)+$/, '')
    if (stripTrailingZeros(tagVersion) === stripTrailingZeros(targetVersion)) return true
    // Handle date-based tags: "2025-11-05" should match "2025.11.5"
    // Convert dashes to dots in tag version, then normalize (removes leading zeros)
    if (tagVersion.includes('-')) {
      const dotted = tagVersion.replace(/-/g, '.')
      if (versionsMatch(normalizeVersion(dotted), targetVersion)) return true
    }
    // Handle zero-padded versions: "17.05" should match "17.5.0"
    const normalizedTag = normalizeVersion(tagVersion)
    if (stripTrailingZeros(normalizedTag) === stripTrailingZeros(targetVersion)) return true
    return false
  }

  // Search through paginated tag results (up to 5 pages = 500 tags)
  for (let page = 1; page <= 5; page++) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/tags?per_page=100&page=${page}`,
        { headers },
      )
      if (!response.ok) {
        console.log(`⚠️  GitHub API returned ${response.status} for ${repo} tags`)
        return null
      }

      const tags: Array<{ name: string }> = await response.json() as any
      if (tags.length === 0) break

      for (const t of tags) {
        const tagName = t.name

        // Try multiple strip approaches: custom regex, then default /^v/ fallback
        const stripVariants: string[] = []

        // 1. Apply custom strip pattern
        const customStripped = tagName.replace(stripRegex, '')
        stripVariants.push(customStripped)

        // 2. If custom strip didn't change the tag, also try default /^v/ strip
        if (customStripped === tagName && tagName.startsWith('v')) {
          stripVariants.push(tagName.replace(/^v/, ''))
        }

        // 3. If custom strip didn't change the tag, try stripping a leading
        // `release[-_]v?` prefix (e.g. pycparser's `release_v3.00`, `release-1.2`).
        // Without this such tags only match via an explicit YAML strip, which
        // native TS recipes can't supply (they have no YAML content).
        if (customStripped === tagName) {
          const releaseStripped = tagName.replace(/^release[-_]v?/i, '')
          if (releaseStripped !== tagName) stripVariants.push(releaseStripped)
        }

        for (const stripped0 of stripVariants) {
          let stripped = stripped0
          // Apply transform if present (e.g. imagemagick: v.replace('-', '.'))
          if (transformFn) {
            try {
              const transformed = transformFn(stripped)
              if (transformed !== undefined) stripped = String(transformed)
            }
catch { /* ignore transform errors */ }
          }

          // Normalize the stripped version and compare (handle trailing .0 mismatches)
          if (versionsMatch(normalizeVersion(stripped), version)) {
            // rawVersion = the stripped (and possibly transformed) version
            return { tag: tagName, rawVersion: stripped }
          }
        }
      }
    }
catch (err: unknown) {
      console.log(`⚠️  GitHub API error for ${repo}: ${(err as Error).message}`)
      return null
    }
  }

  return null
}

// Legacy build override loader (unused — all recipes in src/recipes/)
interface BuildOverrides {
  description?: string
  extraConfigureArgs?: string[]
}

function getBuildOverrides(pkgName: string): BuildOverrides | null {
  const overridesPath = join(process.cwd(), 'src', 'pantry', pkgName, 'build-overrides.json')
  if (!existsSync(overridesPath)) return null

  try {
    const content = readFileSync(overridesPath, 'utf-8')
    return JSON.parse(content)
  }
catch (error: unknown) {
    console.log(`Warning: Failed to parse build-overrides.json for ${pkgName}: ${(error as Error).message}`)
    return null
  }
}

/**
 * Apply buildkit-level recipe overrides that fix platform-specific issues.
 * These live in code (not YAML) so they survive pantry YAML regeneration from upstream.
 *
 * Override definitions are centralized in package-overrides.ts.
 * Applied AFTER YAML parsing but BEFORE build script generation and dependency resolution.
 */
function applyRecipeOverrides(recipe: PackageRecipe, domain: string, platform: string): void {
  const [os] = platform.split('-')

  // Normalize recipe.build to object form up front so all code below can access .env/.dependencies/.script safely
  if (typeof recipe.build === 'string') {
    recipe.build = { script: [recipe.build] }
  }
else if (Array.isArray(recipe.build)) {
    recipe.build = { script: recipe.build }
  }
  // After normalization, build is RecipeBuildConfig | undefined — cast for type narrowing
  const normalizedRecipe = recipe as NormalizedRecipe

  // ── Generic fixes (apply to all packages) ──────────────────────────

  // GNU mirror: ftpmirror.gnu.org is more reliable than ftp.gnu.org
  if (recipe.distributable?.url?.includes('ftp.gnu.org')) {
    recipe.distributable.url = recipe.distributable.url.replace('ftp.gnu.org', 'ftpmirror.gnu.org')
  }

  // X.org mirror: xorg.freedesktop.org is more reliable from CI than www.x.org
  if (recipe.distributable?.url?.includes('www.x.org')) {
    recipe.distributable.url = recipe.distributable.url.replace('www.x.org', 'xorg.freedesktop.org')
  }

  // XCB mirror: xorg.freedesktop.org is more reliable from CI than xcb.freedesktop.org
  if (recipe.distributable?.url?.includes('xcb.freedesktop.org/dist/')) {
    recipe.distributable.url = recipe.distributable.url.replace('xcb.freedesktop.org/dist/', 'xorg.freedesktop.org/archive/individual/xcb/')
  }

  // Fix stray quote in CMAKE_INSTALL_PREFIX (upstream YAML typo in several packages)
  if (normalizedRecipe.build?.env) {
    const fixCmakePrefix = (envObj: Record<string, any>) => {
      if (Array.isArray(envObj.CMAKE_ARGS)) {
        envObj.CMAKE_ARGS = envObj.CMAKE_ARGS.map((arg: string) =>
          typeof arg === 'string' && arg.includes('-DCMAKE_INSTALL_PREFIX="{{prefix}}')
            ? arg.replace('-DCMAKE_INSTALL_PREFIX="{{prefix}}', '-DCMAKE_INSTALL_PREFIX={{prefix}}')
            : arg
        )
      }
    }
    fixCmakePrefix(normalizedRecipe.build.env)
    if (normalizedRecipe.build.env.linux) fixCmakePrefix(normalizedRecipe.build.env.linux)
    if (normalizedRecipe.build.env.darwin) fixCmakePrefix(normalizedRecipe.build.env.darwin)
  }

  // Fix stray quotes in autotools --prefix/--sysconfdir/--libdir args
  // YAML uses --prefix="{{prefix}}" but after env expansion the quotes become literal,
  // causing configure to set prefix to "/tmp/..." (with quotes in the path)
  if (normalizedRecipe.build?.env) {
    const fixAutotoolsQuotes = (envObj: Record<string, any>) => {
      if (Array.isArray(envObj.ARGS)) {
        envObj.ARGS = envObj.ARGS.map((arg: string) =>
          typeof arg === 'string'
            ? arg.replace(/^(--(?:prefix|sysconfdir|libdir|mandir|infodir|datadir|bindir|libexecdir|localstatedir|includedir|exec-prefix)=)"([^"]+)"$/, '$1$2')
            : arg
        )
      }
      if (Array.isArray(envObj.MESON_ARGS)) {
        envObj.MESON_ARGS = envObj.MESON_ARGS.map((arg: string) =>
          typeof arg === 'string'
            ? arg.replace(/^(--prefix=)"([^"]+)"$/, '$1$2')
              .replace(/^(--libdir=)"([^"]+)"$/, '$1$2')
            : arg
        )
      }
    }
    fixAutotoolsQuotes(normalizedRecipe.build.env)
    if (normalizedRecipe.build.env.linux) fixAutotoolsQuotes(normalizedRecipe.build.env.linux)
    if (normalizedRecipe.build.env.darwin) fixAutotoolsQuotes(normalizedRecipe.build.env.darwin)
  }

  // cmake.org from S3 has broken rpaths on macOS (needs libcurl.4.dylib at build-time path).
  // Use Homebrew cmake (4.x) instead, which is pre-installed on CI runners.
  if (os === 'darwin' && normalizedRecipe.build?.dependencies?.['cmake.org']) {
    delete normalizedRecipe.build.dependencies['cmake.org']
  }

  // gnu.org/autoconf from S3 has broken $PREFIX literal in the Perl source (line 38:
  // "$PREFIX'/share/autoconf'"). This causes "syntax error" in autoconf for any package
  // that uses it as a build dep. Use system autoconf instead (pre-installed on CI runners).
  // Also remove automake/libtool S3 deps since they depend on the broken autoconf.
  if (normalizedRecipe.build?.dependencies?.['gnu.org/autoconf']) {
    delete normalizedRecipe.build.dependencies['gnu.org/autoconf']
  }
  if (normalizedRecipe.build?.dependencies?.['gnu.org/automake']) {
    delete normalizedRecipe.build.dependencies['gnu.org/automake']
  }
  if (normalizedRecipe.build?.dependencies?.['gnu.org/libtool']) {
    delete normalizedRecipe.build.dependencies['gnu.org/libtool']
  }

  // Strip pkgx-specific steps from build scripts. These reference tools/vars that don't
  // exist in our buildkit: fix-shebangs.ts (pkgx shebang fixer), $PKGX_DIR, {{pkgx.prefix}}
  if (Array.isArray(normalizedRecipe.build?.script)) {
    for (let i = normalizedRecipe.build.script.length - 1; i >= 0; i--) {
      const step = normalizedRecipe.build.script[i]
      let text = ''
      if (typeof step === 'string') {
        text = step
      }
else if (typeof step === 'object' && step !== null) {
        const runText = typeof step.run === 'string' ? step.run
          : (Array.isArray(step.run) ? step.run.join(' ') : '')
        const propText = typeof step.prop === 'string' ? step.prop : ''
        text = `${runText} ${propText}`
      }
      // Remove steps that are entirely fix-shebangs calls
      if (/^\s*fix-shebangs\.ts\b/.test(text.trim()) || /^\s*run:\s*fix-shebangs\.ts\b/.test(text.trim())) {
        normalizedRecipe.build.script.splice(i, 1)
        continue
      }
      // For multi-line steps or steps with other content, strip just the fix-shebangs lines
      if (typeof step === 'string' && text.includes('fix-shebangs.ts')) {
        normalizedRecipe.build.script[i] = step.split('\n')
          .filter((line: string) => !line.trim().startsWith('fix-shebangs.ts'))
          .join('\n')
      }
      if (typeof step === 'object' && typeof step.run === 'string' && step.run.includes('fix-shebangs.ts')) {
        step.run = step.run.split('\n')
          .filter((line: string) => !line.trim().startsWith('fix-shebangs.ts'))
          .join('\n')
      }
      if (typeof step === 'object' && Array.isArray(step.run)) {
        step.run = step.run.filter((line: string) =>
          typeof line !== 'string' || !line.trim().startsWith('fix-shebangs.ts')
        )
      }
    }
  }

  // ── Inline legacy override ─────────────────────────────────────────

  // x.org/x11: disable local-transport on Linux (sys/stropts.h removed in glibc 2.38+)
  if (domain === 'x.org/x11' && os === 'linux') {
    if (normalizedRecipe.build?.env) {
      const env = normalizedRecipe.build.env
      if (Array.isArray(env.ARGS)) {
        env.ARGS.push('--disable-local-transport')
      }
else {
        if (!env.linux) env.linux = {}
        if (!env.linux.ARGS) env.linux.ARGS = []
        if (!Array.isArray(env.linux.ARGS)) env.linux.ARGS = [env.linux.ARGS]
        env.linux.ARGS.push('--disable-local-transport')
      }
    }
  }

  // ── Centralized package overrides from package-overrides.ts ────────

  const override = packageOverrides[domain]
  if (!override) return

  console.log(`  Applying durable override for ${domain}`)

  // (normalization already done at top of function)

  // 1. Override distributable URL
  if (override.distributableUrl) {
    if (!recipe.distributable) recipe.distributable = { url: '' }
    recipe.distributable.url = override.distributableUrl
  }
  if (override.stripComponents !== undefined && recipe.distributable) {
    recipe.distributable['strip-components'] = override.stripComponents
  }

  // 2. Merge top-level env overrides into normalizedRecipe.build.env
  if (override.env) {
    if (!normalizedRecipe.build) normalizedRecipe.build = {}
    if (!normalizedRecipe.build.env) normalizedRecipe.build.env = {}
    for (const [key, value] of Object.entries(override.env)) {
      normalizedRecipe.build.env[key] = value
    }
  }

  // 3. Apply platform-specific overrides (env, distributable)
  const platformOverride = os === 'linux' ? override.platforms?.linux
    : os === 'darwin' ? override.platforms?.darwin
    : null

  if (platformOverride) {
    // Platform distributable URL
    if (platformOverride.distributableUrl) {
      if (!normalizedRecipe.distributable) normalizedRecipe.distributable = { url: '' }
      normalizedRecipe.distributable.url = platformOverride.distributableUrl
    }
    if (platformOverride.stripComponents !== undefined && normalizedRecipe.distributable) {
      normalizedRecipe.distributable['strip-components'] = platformOverride.stripComponents
    }

    // Platform env → merged into normalizedRecipe.build.env.<os> section
    if (platformOverride.env) {
      if (!normalizedRecipe.build) normalizedRecipe.build = {}
      if (!normalizedRecipe.build.env) normalizedRecipe.build.env = {}
      if (!normalizedRecipe.build.env[os]) normalizedRecipe.build.env[os] = {}
      for (const [key, value] of Object.entries(platformOverride.env)) {
        normalizedRecipe.build.env[os][key] = value
      }
    }
  }

  // 4. Override recipe platforms if supportedPlatforms is specified
  if (override.supportedPlatforms) {
    normalizedRecipe.platforms = override.supportedPlatforms
  }

  // 5. Apply modifyRecipe callback for complex mutations
  // Run BEFORE prependScript so that prependScript always prepends to the final script
  // (modifyRecipe may replace the entire build script, e.g. pre-built binary downloads)
  if (override.modifyRecipe) {
    override.modifyRecipe(normalizedRecipe, platform)
  }

  // 6. Prepend script steps (run before existing build script)
  // Applied last so they always appear at the start, even after modifyRecipe replaces the script
  if (override.prependScript && override.prependScript.length > 0) {
    if (!normalizedRecipe.build) normalizedRecipe.build = {}
    const existing = normalizedRecipe.build.script
    const existingArray = Array.isArray(existing) ? existing : (existing ? [existing] : [])
    normalizedRecipe.build.script = [...override.prependScript as RecipeScriptStep[], ...existingArray]
  }

  // 7. Platform-specific prependScript (also after modifyRecipe)
  if (platformOverride?.prependScript && platformOverride.prependScript.length > 0) {
    if (!normalizedRecipe.build) normalizedRecipe.build = {}
    const existing = normalizedRecipe.build.script
    const existingArray = Array.isArray(existing) ? existing : (existing ? [existing] : [])
    normalizedRecipe.build.script = [...platformOverride.prependScript as RecipeScriptStep[], ...existingArray]
  }
}

async function downloadSource(url: string, destDir: string, stripComponents: number = 1, ref?: string, pkgDomain?: string, pkgVersion?: string): Promise<void> {
  console.log(`📥 Downloading source from ${url}`)

  // Handle non-archive single files (.jar, .war, .bin, etc.) — save directly, don't extract
  const nonArchiveExts = ['.jar', '.war', '.bin', '.exe', '.AppImage', '.whl', '.gem', '.phar']
  let urlPath: string
  try {
    urlPath = new URL(url.replace(/ /g, '%20')).pathname
  }
catch {
    urlPath = url.split('?')[0] // fallback for malformed URLs
  }
  const matchedExt = nonArchiveExts.find(ext => urlPath.endsWith(ext))
  if (matchedExt) {
    const encodedUrl = url.replace(/ /g, '%20')
    // Save with pkgx naming convention: <domain>-<version>.<ext>
    // Replace forward slashes in domain with Unicode division slash (U+2215) to match YAML conventions
    const safeDomain = pkgDomain ? pkgDomain.replace(/\//g, '\u2215') : ''
    const fileName = pkgDomain && pkgVersion ? `${safeDomain}-${pkgVersion}${matchedExt}` : urlPath.split('/').pop() || `download${matchedExt}`
    const destFile = join(destDir, fileName)
    console.log(`📦 Saving non-archive file as ${fileName}`)
    execSync(`curl -fSL --connect-timeout 30 --max-time 600 --retry 2 --retry-delay 5 -o "${destFile}" "${encodedUrl}"`, { stdio: 'inherit' })
    return
  }

  // Handle git+https:// URLs — clone the repo
  if (url.startsWith('git+https://') || url.startsWith('git+http://')) {
    const gitUrl = url.replace(/^git\+/, '')
    console.log(`📦 Cloning git repository...`)
    // Clone with specific ref/tag if provided, shallow for speed
    const refArg = ref ? `--branch "${ref}" --single-branch` : ''
    // Fetch submodules at clone time — packages like mariadb.com/server vendor
    // their build inputs (libmariadb, wsrep, …) as git submodules and their
    // CMake aborts ("submodules.cmake") if they're missing. `--shallow-submodules`
    // keeps it fast; harmless for repos without submodules.
    try {
      execSync(`git clone --depth 1 --recurse-submodules --shallow-submodules ${refArg} "${gitUrl}" "${destDir}/_git_clone"`, { stdio: 'inherit' })
    }
catch {
      // If shallow clone with ref fails, try full clone + checkout
      try {
        execSync(`git clone --recurse-submodules "${gitUrl}" "${destDir}/_git_clone"`, { stdio: 'inherit' })
      }
catch (cloneError: unknown) {
        const err = new Error(`DOWNLOAD_FAILED: Failed to clone ${gitUrl}`) as any
        err._downloadFailure = true
        throw err
      }
      if (ref) {
        try {
          execSync(`cd "${destDir}/_git_clone" && git checkout "${ref}" && git submodule update --init --recursive`, { stdio: 'inherit' })
        }
catch {
          console.log(`Warning: Could not checkout ref ${ref}, using default branch`)
        }
      }
    }
    // Move cloned content to build dir
    execSync(`cp -a "${destDir}/_git_clone/." "${destDir}/"`, { stdio: 'pipe' })
    execSync(`rm -rf "${destDir}/_git_clone"`, { stdio: 'pipe' })
    return
  }

  // Determine file extension from URL
  const isZip = url.endsWith('.zip')
  const tempFile = join(destDir, isZip ? 'source.zip' : 'source.tar.gz')

  // Download using curl (follow redirects, fail on HTTP errors)
  // Encode spaces and special chars in URLs (e.g. xpra.org has "xpra 6.4.3" in tag)
  const encodedUrl = url.replace(/ /g, '%20')
  try {
    // --connect-timeout 30: fail fast if server doesn't respond
    // --max-time 600: abort if download takes >10 minutes (SourceForge can be very slow)
    // --retry 2 --retry-delay 5: retry on transient failures
    execSync(`curl -fSL --connect-timeout 30 --max-time 600 --retry 2 --retry-delay 5 -o "${tempFile}" "${encodedUrl}"`, { stdio: 'inherit' })
  }
catch (curlError: unknown) {
    const err = new Error(`DOWNLOAD_FAILED: Failed to download ${url}`) as any
    err._downloadFailure = true
    throw err
  }

  // Validate downloaded file is not a tiny error page
  const fileSize = statSync(tempFile).size
  if (fileSize < 1000) {
    const err = new Error(`Downloaded file is too small (${fileSize} bytes) — likely an error page, not a source archive`) as any
    err._downloadFailure = true
    throw err
  }

  console.log(`📦 Extracting source to ${destDir}`)

  if (isZip) {
    // For zip: extract then unwrap top-level directory if strip-components > 0
    const tmpExtract = join(destDir, '__zip_extract__')
    mkdirSync(tmpExtract, { recursive: true })
    execSync(`unzip -q -o "${tempFile}" -d "${tmpExtract}"`, { stdio: 'inherit' })

    if (stripComponents > 0) {
      // Apply strip-components by unwrapping top-level directories
      let currentDir = tmpExtract
      for (let s = 0; s < stripComponents; s++) {
        const entries = execSync(`ls "${currentDir}"`, { encoding: 'utf-8' }).trim().split('\n').filter(e => e)
        if (entries.length === 1) {
          const entryPath = join(currentDir, entries[0])
          // Only strip if the single entry is a directory (not a file like a .jar)
          try {
            if (statSync(entryPath).isDirectory()) {
              currentDir = entryPath
              continue
            }
          }
catch { /* stat failed, not a directory */ }
        }
        // Can't strip further (multiple entries or single file)
        break
      }
      execSync(`cp -a "${currentDir}/." "${destDir}/"`, { stdio: 'pipe' })
    }
else {
      execSync(`cp -a "${tmpExtract}/." "${destDir}/"`, { stdio: 'pipe' })
    }
    execSync(`rm -rf "${tmpExtract}"`)
  }
else {
    // tar auto-detects format (gz, xz, bz2, zstd)
    execSync(`tar -xf "${tempFile}" -C "${destDir}" --strip-components=${stripComponents}`, { stdio: 'inherit' })
  }

  // Remove temp file
  execSync(`rm -f "${tempFile}"`)
}

function runCommand(cmd: string, cwd: string, env: Record<string, string>): void {
  console.log(`\n🔧 Running: ${cmd.slice(0, 100)}${cmd.length > 100 ? '...' : ''}`)

  try {
    execSync(cmd, {
      cwd,
      env: { ...process.env, ...env },
      stdio: 'inherit',
      shell: '/bin/bash',
    })
  }
catch (error: unknown) {
    console.error(`❌ Command failed: ${cmd}`)
    throw error
  }
}

// Convert domain to pantry key (php.net -> phpnet)
function domainToKey(domain: string): string {
  return domain.replace(/[.\-/]/g, '').toLowerCase()
}

// Extract dependency domains from YAML build.dependencies object
// Handles both flat: { "domain.com": ">=1.0" } and platform-specific: { linux: { "domain.com": "*" } }
function extractYamlDeps(depsObj: any, platform: string): string[] {
  if (!depsObj || typeof depsObj !== 'object') return []
  const [os] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const deps: string[] = []

  for (const [key, value] of Object.entries(depsObj)) {
    // Check if this is a platform key (darwin, linux, darwin/aarch64)
    if (/^(?:darwin|linux)(?:\/.*)?$/.test(key)) {
      // Only include deps from matching platform
      const [condOs] = key.split('/')
      if (condOs === osName && typeof value === 'object' && value !== null) {
        for (const [subKey, subVal] of Object.entries(value)) {
          if (subKey.includes('.') || subKey.includes('/')) {
            // Include version constraint (e.g., "python.org: ~3.11" → "python.org ~3.11")
            const constraint = typeof subVal === 'string' ? subVal.trim() : ''
            deps.push(constraint && constraint !== '*' ? `${subKey} ${constraint}` : subKey)
          }
        }
      }
    }
else if (key.includes('.') || key.includes('/')) {
      // Regular dependency domain — include constraint from value
      const constraint = typeof value === 'string' ? value.trim() : ''
      deps.push(constraint && constraint !== '*' ? `${key} ${constraint}` : key)
    }
  }
  return deps
}

// Parse dependency string to get domain
export function parseDep(dep: string): string {
  let domain = dep
  // Remove platform prefix. Anchored to the two real prefixes, like
  // parseDepConstraint: a bare `split(':')[1]` mangles any other colon and
  // returns undefined for a dep that has none.
  if (/^(?:darwin|linux):/i.test(domain)) {
    domain = domain.split(':').slice(1).join(':')
  }
  // Remove version constraints
  domain = domain.replace(/[\^~<>=@].*$/, '')
  // Remove comments
  domain = domain.replace(/#.*$/, '').trim()
  // ...including a bare, space-separated one. parseDepConstraint already reads
  // `freetype.org 2` as the constraint "2", but this left the " 2" ON THE
  // DOMAIN — so the lookup asked S3 for `binaries/freetype.org 2/metadata.json`,
  // got a 404, and reported "not in S3, falling back to system path → /usr".
  // Silently: the dep resolved to a prefix with no freetype in it, and
  // ghostscript.com then failed configure with "No usable Freetype source or
  // library found" on every platform, every sweep. zlib.net, bzip2 and libxml2
  // were being dropped the same way in the same build.
  //
  // The two parsers have to agree on where the domain ends; a test pins that.
  domain = domain.replace(/\s+\d[\d.]*$/, '').trim()
  return domain
}

// Extract version constraint from dependency string (e.g., "python.org: ~3.11" → "~3.11")
export function parseDepConstraint(dep: string): string | null {
  let spec = dep
  // Remove platform prefix
  if (spec.includes(':') && /^(?:darwin|linux):/i.test(spec)) {
    spec = spec.split(':').slice(1).join(':')
  }
  // Remove comments
  spec = spec.replace(/#.*$/, '').trim()
  // Extract constraint: everything after the domain that starts with a version operator
  // Also handle bare version numbers like "nodejs.org 22" or "python.org 3.11"
  const match = spec.match(/([\^~<>=@]+.*)$/) || spec.match(/\s(\d[\d.]*)$/)
  if (!match) return null
  let constraint = match[1].trim()
  // Strip wrapping quotes
  if ((constraint.startsWith('"') && constraint.endsWith('"')) ||
      (constraint.startsWith('\'') && constraint.endsWith('\''))) {
    constraint = constraint.slice(1, -1)
  }
  // "*" means any version
  if (constraint === '*') return null
  return constraint
}

// Parse a semver string into components
/** Use the SDK's runtime constraint policy for the libraries we compile against. */
export function versionSatisfies(version: string, constraint: string): boolean {
  const requested = constraint.trim()
  if (version === requested) return true
  if (requested === '*' || requested === 'latest') return !version.includes('-')

  return requested.split('||').some((alternative) => {
    let remaining = alternative.trim()
    if (!remaining) return false
    while (remaining) {
      const token = remaining.match(/^([~^]|>=|<=|>|<|=|@)?\s*(\d+(?:\.\d+){0,10}(?:-[0-9A-Za-z.-]+)?(?:[+_][0-9A-Za-z.-]+)?)/)
      if (!token) return false
      const [, operator, target] = token
      if (!operator && !target.includes('-') && !target.includes('+') && !target.includes('_') && target.split('.').length < 3) {
        if (version.includes('-')) return false
        const offered = version.split(/[+_]/, 1)[0].split('.')
        if (!target.split('.').every((part, index) => Number.parseInt(offered[index], 10) === Number(part))) return false
      }
      else {
        const parsed = parseInstallerConstraint(`${operator === '@' ? '=' : operator || '='}${target}`)
        if (!parsed || !satisfiesInstallerConstraint(version, parsed)) return false
      }
      remaining = remaining.slice(token[0].length).trim()
    }
    return true
  })
}

export class BuildDependencyResolutionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BuildDependencyResolutionError'
  }
}

interface BuildDependencyMetadata {
  versions?: Record<string, { platforms?: Record<string, unknown> }>
}

/** Never substitute another platform or incompatible ABI for a declared range. */
export function buildDependencyCandidates(
  metadata: BuildDependencyMetadata,
  platform: string,
  constraint: string | null,
  availableVersions: string[] = Object.keys(metadata.versions || {}),
): string[] {
  const candidates = availableVersions
    .filter(version => metadata.versions?.[version]?.platforms?.[platform] && (!constraint || versionSatisfies(version, constraint)))
    .sort(compareInstallerVersionsDesc)
  if (candidates.length === 0)
    throw new BuildDependencyResolutionError(constraint ? `No ${platform} dependency binary satisfies "${constraint}"` : `No published dependency binary is available for ${platform}`)
  return candidates
}

interface BuildDependencyStorage {
  getObject: (bucket: string, key: string) => Promise<string>
  getSignedUrl: (options: { bucket: string, key: string, expiresIn: number }) => Promise<string>
}

// Download declared dependencies; never compile against an undeclared host ABI.
export async function downloadDependencies(
  dependencies: string[],
  depsDir: string,
  platform: string,
  bucket: string,
  region: string,
  storage?: BuildDependencyStorage,
): Promise<Record<string, string>> {
  const s3 = storage ?? await (async () => {
    const { createObjectStorageClient } = await import('@stacksjs/ts-cloud')
    const provider = (process.env.STORAGE_PROVIDER || 'aws') as 'aws' | 'backblaze' | 'hetzner'
    return createObjectStorageClient({ provider, region: provider === 'aws' ? region : undefined })
  })()
  const depPaths: Record<string, string> = {}
  const platformOs = platform.split('-')[0]

  console.log(`\nDownloading ${dependencies.length} dependencies from S3...`)

  for (const dep of dependencies) {
    // Skip platform-specific deps for other platforms
    if (dep.includes(':')) {
      const [depPlatform] = dep.split(':')
      if (depPlatform === 'linux' && platformOs === 'darwin') continue
      if (depPlatform === 'darwin' && platformOs === 'linux') continue
    }

    const domain = parseDep(dep)
    const constraint = parseDepConstraint(dep)
    if (!domain || domain.match(/^(darwin|linux)\//)) continue

    try {
      // Get metadata to find latest version
      const metadataKey = `binaries/${domain}/metadata.json`
      let metadata: any

      try {
        const metadataContent = await s3.getObject(bucket, metadataKey)
        metadata = JSON.parse(metadataContent)
      }
catch {
        throw new BuildDependencyResolutionError(`${domain}: declared dependency metadata is unavailable`)
      }

      // Resolve the same range used by the installed runtime dependency graph.
      let availableVersions = Object.keys(metadata.versions || {})

      // Ghost-version guard: a builder on stale code can re-publish a version we've
      // YANKED from the catalog (e.g. the autoconf 2.73 alpha) back into S3, where the
      // resolver would otherwise pick it as "latest" and re-break consumers. Restrict to
      // versions the catalog still declares — but only when we have catalog data for this
      // dep (so deps absent from our local catalog still resolve straight from S3).
      const _depCatalog = lookupPantryPackage(domain)
      if (_depCatalog?.versions?.length) {
        const allowed = new Set<string>(_depCatalog.versions as string[])
        const filtered = availableVersions.filter(v => allowed.has(v))
        if (filtered.length)
          availableVersions = filtered
      }

      // Helper: download and register a dep version
      const downloadAndRegisterDep = async (depVersion: string, info: any): Promise<boolean> => {
        const depInstallDir = join(depsDir, domain, depVersion)
        mkdirSync(depInstallDir, { recursive: true })
        const tarballPath = join(depInstallDir, 'package.tar.gz')
        try {
          // Presigned GET works for private buckets on any S3-compatible provider
          // (AWS, Hetzner, B2); avoids the aws CLI and a hardcoded amazonaws.com host.
          const dlUrl = await s3.getSignedUrl({ bucket, key: info.tarball, expiresIn: 3600 })
          execSync(`curl -fsSL -o "${tarballPath}" "${dlUrl}"`, { stdio: 'pipe' })
          if (!/^[a-f0-9]{64}$/i.test(info.sha256 || '') || new Bun.CryptoHasher('sha256').update(readFileSync(tarballPath)).digest('hex') !== info.sha256.toLowerCase())
            throw new BuildDependencyResolutionError(`${domain}@${depVersion}: dependency archive checksum mismatch or missing`)
          execSync(`tar -xf "${tarballPath}" -C "${depInstallDir}"`, { stdio: 'pipe' })
          execSync(`rm "${tarballPath}"`)
        }
catch (cause) {
          if (cause instanceof BuildDependencyResolutionError) throw cause
          return false
        }
        // Fix pkg-config files
        for (const pcSubdir of ['lib/pkgconfig', 'share/pkgconfig']) {
          const pcDir = join(depInstallDir, pcSubdir)
          if (existsSync(pcDir)) {
            try {
              for (const pcFile of readdirSync(pcDir).filter(f => f.endsWith('.pc'))) {
                const pcPath = join(pcDir, pcFile)
                const content = readFileSync(pcPath, 'utf-8')
                const replaced = content.replace(/\/tmp\/buildkit-install-[^\s/]+(\/[^\s]*)?/g, (match) => {
                  const afterPrefix = match.replace(/^\/tmp\/buildkit-install-[^\s/]+/, '')
                  return depInstallDir + afterPrefix
                })
                if (replaced !== content) writeFileSync(pcPath, replaced)
              }
            }
catch { /* ignore */ }
          }
        }
        // Register paths and version template variables
        const key = depPaths[`deps.${domain}.version`] && depPaths[`deps.${domain}.version`] !== depVersion ? `${domain}@${depVersion}` : domain
        depPaths[key] = depInstallDir
        depPaths[`deps.${key}.prefix`] = depInstallDir
        const vParts = depVersion.split('.')
        depPaths[`deps.${key}.version`] = depVersion
        depPaths[`deps.${key}.version.major`] = vParts[0] || '0'
        depPaths[`deps.${key}.version.minor`] = vParts[1] || '0'
        depPaths[`deps.${key}.version.patch`] = vParts[2] || '0'
        depPaths[`deps.${key}.version.marketing`] = `${vParts[0] || '0'}.${vParts[1] || '0'}`
        return true
      }

      const candidates = buildDependencyCandidates(metadata, platform, constraint, availableVersions)
      let resolved = false
      const version = candidates[0]
      if (version) {
        console.log(`   - ${domain}@${version}${constraint ? ` (${constraint})` : ''}`)
        resolved = await downloadAndRegisterDep(version, metadata.versions[version].platforms[platform])
      }
      if (!resolved)
        throw new BuildDependencyResolutionError(`${domain}: could not install the ${platform} dependency${constraint ? ` satisfying "${constraint}"` : ''}`)

    }
catch (error: unknown) {
      if (error instanceof BuildDependencyResolutionError) throw error
      throw new BuildDependencyResolutionError(`${domain}: declared dependency resolution failed`)
    }
  }

  return depPaths
}

function runHealthCheck(
  test: RecipeTest,
  prefix: string,
  templateVars: Record<string, string>,
  depPaths: Record<string, string>,
  platform: string,
): void {
  // Build test script from recipe's test section
  let testCommands: string[] = []
  let fixture: string | undefined

  if (typeof test === 'string') {
    // Simple: test: "curl --version"
    testCommands = [test]
  }
else if (Array.isArray(test)) {
    // List: test:\n  - curl -i example.com\n  - curl --version
    testCommands = test.filter((t: RecipeScriptStep) => typeof t === 'string') as string[]
  }
else if (typeof test === 'object') {
    // Object: test:\n  script: |\n    nim r hello.nim\n  fixture: |\n    echo "Hello"
    if (typeof test.script === 'string') {
      testCommands = test.script.split('\n').filter((l: string) => l.trim())
    }
else if (Array.isArray(test.script)) {
      for (const step of test.script) {
        if (typeof step === 'string') testCommands.push(step)
        else if (typeof step === 'object' && typeof step.run === 'string') {
          testCommands.push(...step.run.split('\n').filter((l: string) => l.trim()))
        }
      }
    }
    if (typeof test.fixture === 'string') {
      fixture = test.fixture
    }
  }

  if (testCommands.length === 0) return

  // Interpolate template variables
  testCommands = testCommands.map(cmd => interpolate(cmd, templateVars))

  // Build PATH with prefix/bin and dep paths (only .prefix keys are actual install paths)
  const pathParts = [`${prefix}/bin`, `${prefix}/sbin`]
  for (const [key, depDir] of Object.entries(depPaths)) {
    if (!key.endsWith('.prefix')) continue
    pathParts.push(`${depDir}/bin`)
  }
  pathParts.push(process.env.PATH || '/usr/bin:/bin')
  const testPath = pathParts.join(':')

  // Build LD_LIBRARY_PATH / DYLD_FALLBACK_LIBRARY_PATH
  const libParts = [`${prefix}/lib`]
  for (const [key, depDir] of Object.entries(depPaths)) {
    if (!key.endsWith('.prefix')) continue
    libParts.push(`${depDir}/lib`)
  }
  const [os] = platform.split('-')
  const libVar = os === 'darwin' ? 'DYLD_FALLBACK_LIBRARY_PATH' : 'LD_LIBRARY_PATH'

  // Create a temp directory for the test
  const testDir = `/tmp/buildkit-test-${Date.now()}`
  mkdirSync(testDir, { recursive: true })

  // Write fixture file if provided
  if (fixture) {
    writeFileSync(join(testDir, 'FIXTURE'), interpolate(fixture, templateVars))
  }

  // Build the test script
  const testScript = [
    '#!/bin/bash',
    'set -eo pipefail',
    `export PATH="${testPath}"`,
    `export ${libVar}="${libParts.join(':')}"`,
    `export PKG_CONFIG_PATH="${prefix}/lib/pkgconfig"`,
    fixture ? `export FIXTURE="${join(testDir, 'FIXTURE')}"` : '',
    `cd "${testDir}"`,
    ...testCommands,
  ].filter(Boolean).join('\n')

  const testScriptPath = join(testDir, '_test.sh')
  writeFileSync(testScriptPath, testScript, { mode: 0o755 })

  try {
    execSync(`bash "${testScriptPath}"`, {
      cwd: testDir,
      env: {
        ...process.env,
        PATH: testPath,
        [libVar]: libParts.join(':'),
        PKG_CONFIG_PATH: `${prefix}/lib/pkgconfig`,
        HOME: process.env.HOME || '/tmp',
      },
      stdio: 'inherit',
      timeout: 30000, // 30s timeout for health checks
    })
  }
finally {
    // Clean up test dir
    try { execSync(`rm -rf "${testDir}"`, { stdio: 'ignore' }) }
    catch (e) { console.warn(`Warning: failed to clean test dir: ${(e as Error).message}`) }
  }
}

export function isRequiredHealthCheck(test: RecipeTest): boolean {
  return typeof test === 'object' && !Array.isArray(test) && test.required === true
}

/** Merge the declared metadata and normalized recipe graph before resolution. */
export function collectBuildDependencies(
  metadata: { dependencies?: string[], buildDependencies?: string[] },
  yamlBuildDeps: string[],
  yamlRuntimeDeps: string[],
  removedDeps: ReadonlySet<string> = new Set(),
): Map<string, string> {
  const tsDeps = [...(metadata.dependencies || []), ...(metadata.buildDependencies || [])]
  const depByDomain = new Map<string, string>()
  // First pass: add TS deps
  for (const dep of tsDeps) {
    const domain = parseDep(dep)
    if (domain && !removedDeps.has(domain)) depByDomain.set(domain, dep)
  }
  // Second pass: YAML deps from normalizedRecipe (after overrides) take precedence.
  // When an override changes a constraint (e.g., python.org: ~3.10 → >=3.10<3.14),
  // the overridden value should REPLACE the TS dep constraint, not merge with it.
  // Only merge when both build AND runtime YAML deps specify different constraints
  // for the same domain (e.g., build: ">=2.3" + runtime: "<4" → ">=2.3<4").
  const recipeDomains = new Set<string>()
  for (const dep of [...yamlBuildDeps, ...yamlRuntimeDeps]) {
    const domain = parseDep(dep)
    if (!domain || removedDeps.has(domain)) continue
    const existing = depByDomain.get(domain)
    const existingIsFromTs = !recipeDomains.has(domain)
    recipeDomains.add(domain)
    if (existing) {
      const existingConstraint = parseDepConstraint(existing)
      const newConstraint = parseDepConstraint(dep)
      // Check if the existing entry came from TS deps (pre-override) vs YAML deps
      if (existingIsFromTs) {
        // Override replaces TS constraint entirely
        depByDomain.set(domain, dep)
      }
else if (existingConstraint && newConstraint && existingConstraint !== newConstraint) {
        // Both from YAML (build + runtime) — merge constraints
        depByDomain.set(domain, `${domain} ${existingConstraint}${newConstraint}`)
      }
      continue
    }
    depByDomain.set(domain, dep)
  }
  return depByDomain
}

/** Resolve the complete runtime closure before choosing any artifact versions. */
export async function resolveBuildDependencyGraph(
  initial: Map<string, string>,
  platform: string,
  load: (domain: string, constraint: string | null) => Promise<{ dependencies?: PackageRecipe['dependencies'] }>,
): Promise<Map<string, string>> {
  const graph = new Map(initial)
  const pending = [...graph.keys()]
  const visited = new Set<string>()
  for (let position = 0; position < pending.length; position++) {
    const domain = pending[position]
    if (visited.has(domain)) continue
    visited.add(domain)
    // These are already-built dependencies: their runtime closure is needed,
    // while their own compiler/build dependencies are not part of this build.
    const recipe = await load(domain, parseDepConstraint(graph.get(domain)!))
    for (const dependency of extractYamlDeps(recipe.dependencies, platform)) {
      const child = parseDep(dependency)
      if (!child) throw new Error(`Invalid runtime dependency of ${domain}: ${dependency}`)
      const existing = graph.get(child)
      if (!existing) {
        graph.set(child, dependency)
        pending.push(child)
        continue
      }
      const previous = parseDepConstraint(existing)
      const constraint = parseDepConstraint(dependency)
      if (constraint && constraint !== previous)
        graph.set(child, previous ? `${child} ${previous} ${constraint}` : dependency)
    }
  }
  return graph
}

/** Recompute version-dependent edges until every declared bound is stable. */
export async function resolveVersionedBuildDependencyGraph(
  initial: Map<string, string>,
  platform: string,
  metadata: (domain: string) => Promise<BuildDependencyMetadata>,
  load: (domain: string, version: string) => Promise<{ dependencies?: PackageRecipe['dependencies'] }>,
): Promise<Map<string, string>> {
  let previous = new Map(initial)
  const seen = new Set<string>()
  const snapshot = (graph: Map<string, string>) => JSON.stringify([...graph].sort(([a], [b]) => a.localeCompare(b)))
  for (;;) {
    const graph = await resolveBuildDependencyGraph(initial, platform, async (domain, constraint) => {
      const info = await metadata(domain)
      const catalog = lookupPantryPackage(domain)?.versions as string[] | undefined
      const published = Object.keys(info.versions || {})
      const allowed = catalog?.length ? published.filter(version => catalog.includes(version)) : published
      let version: string
      try {
        version = buildDependencyCandidates(info, platform, parseDepConstraint(previous.get(domain) || '') || constraint, allowed.length ? allowed : published)[0]
      }
      catch (cause) {
        throw new BuildDependencyResolutionError(`${domain}: ${cause instanceof Error ? cause.message : String(cause)}`)
      }
      return load(domain, version)
    })
    const state = snapshot(graph)
    if (state === snapshot(previous)) return graph
    if (seen.has(state)) throw new BuildDependencyResolutionError('Version-dependent runtime constraints do not converge')
    seen.add(state)
    previous = graph
  }
}

async function publishedDependencyGraph(initial: Map<string, string>, platform: string, bucket: string, region: string): Promise<Map<string, string>> {
  const { createObjectStorageClient } = await import('@stacksjs/ts-cloud')
  const { loadRecipe } = await import('./recipe-loader')
  const provider = (process.env.STORAGE_PROVIDER || 'aws') as 'aws' | 'backblaze' | 'hetzner'
  const storage = createObjectStorageClient({ provider, region: provider === 'aws' ? region : undefined })
  const cache = new Map<string, Promise<BuildDependencyMetadata>>()
  const metadata = (domain: string) => {
    if (!cache.has(domain)) cache.set(domain, storage.getObject(bucket, `binaries/${domain}/metadata.json`).then(value => JSON.parse(value)))
    return cache.get(domain)!
  }
  const load = async (domain: string, version: string) => (await loadRecipe(domain, platform, version)).recipe
  try {
    return await resolveVersionedBuildDependencyGraph(initial, platform, metadata, load)
  }
  catch (cause) {
    if (!(cause instanceof BuildDependencyResolutionError) || !cause.message.includes('dependency binary satisfies')) throw cause
    // Hoist compatible requirements; isolate genuinely different runtime ABIs.
    // The native bundler still rejects ambiguous providers of the same SONAME.
    return resolveCoexistingRuntimeGraph(initial, platform, metadata, load)
  }
}

export async function resolveCoexistingRuntimeGraph(
  initial: Map<string, string>,
  platform: string,
  metadata: (domain: string) => Promise<BuildDependencyMetadata>,
  load: (domain: string, version: string) => Promise<{ dependencies?: PackageRecipe['dependencies'] }>,
): Promise<Map<string, string>> {
  const graph = new Map<string, string>()
  const roots = new Map<string, string>()
  const queue: Array<{ domain: string, version: string }> = []
  const candidates = async (domain: string, constraint: string | null) => {
    const info = await metadata(domain)
    const published = Object.keys(info.versions || {})
    const catalog = lookupPantryPackage(domain)?.versions as string[] | undefined
    const allowed = catalog?.length ? published.filter(version => catalog.includes(version)) : published
    try { return buildDependencyCandidates(info, platform, constraint, allowed.length ? allowed : published) }
    catch (cause) { throw new BuildDependencyResolutionError(`${domain}: ${cause instanceof Error ? cause.message : String(cause)}`) }
  }
  for (const [domain, dependency] of initial) roots.set(domain, (await candidates(domain, parseDepConstraint(dependency)))[0])
  const add = async (domain: string, constraint: string | null) => {
    const preferred = roots.get(domain)
    const version = preferred && (!constraint || versionSatisfies(preferred, constraint)) ? preferred : (await candidates(domain, constraint))[0]
    const existing = [...graph].find(([, spec]) => parseDep(spec) === domain && parseDepConstraint(spec) === `=${version}`)
    if (existing) return
    const key = graph.has(domain) ? `${domain}@${version}` : domain
    graph.set(key, `${domain} =${version}`)
    queue.push({ domain, version })
  }
  for (const [domain, dependency] of initial) await add(domain, parseDepConstraint(dependency))
  for (let index = 0; index < queue.length; index++) {
    const parent = queue[index]
    const recipe = await load(parent.domain, parent.version)
    for (const dependency of extractYamlDeps(recipe.dependencies, platform)) await add(parseDep(dependency), parseDepConstraint(dependency))
  }
  return graph
}

/** Build executables keep their private runtime ABIs out of the target linker graph. */
export async function installBuildDependencyGraphs(
  runtimeDeclared: Map<string, string>,
  declared: Map<string, string>,
  depsDir: string,
  resolve: (initial: Map<string, string>) => Promise<Map<string, string>>,
  download: (graph: Map<string, string>, directory: string) => Promise<Record<string, string>>,
): Promise<{ depPaths: Record<string, string>, runtimePackages: RuntimePackage[] }> {
  const runtime = new Map(runtimeDeclared)
  for (const domain of runtime.keys()) if (declared.has(domain)) runtime.set(domain, declared.get(domain)!)
  let graph = await resolve(runtime)
  for (const [domain, dependency] of declared) {
    if (!runtime.has(domain) && graph.has(domain)) {
      const constraint = parseDepConstraint(dependency)
      runtime.set(domain, constraint ? `${graph.get(domain)} ${constraint}` : graph.get(domain)!)
    }
  }
  if (runtime.size !== runtimeDeclared.size) graph = await resolve(runtime)
  const depPaths = await download(graph, depsDir)
  const runtimePackages = [...graph.keys()].map((domain) => {
    const prefix = depPaths[`deps.${domain}.prefix`]
    const version = depPaths[`deps.${domain}.version`]
    if (!prefix || !version) throw new Error(`Unresolved declared runtime package: ${domain}`)
    return { domain: parseDep(domain), version, prefix }
  })
  for (const [domain, dependency] of declared) {
    if (graph.has(domain)) continue
    const tools = await resolve(new Map([[domain, dependency]]))
    const paths = await download(tools, join(depsDir, '.build-tools', encodeURIComponent(domain)))
    for (const [key, value] of Object.entries(paths)) {
      if (key === domain || key.startsWith(`deps.${domain}.`)) depPaths[key] = value
    }
    for (const child of tools.keys()) {
      if (child !== domain) depPaths[`build-tools.${domain}:${child}.prefix`] = paths[`deps.${child}.prefix`]
    }
  }
  return { depPaths, runtimePackages }
}

/** Mirrored binaries must satisfy the same declared runtime closure as source builds. */
export async function downloadRuntimePackages(domain: string, version: string, platform: string, depsDir: string, bucket: string, region: string): Promise<RuntimePackage[]> {
  const { loadRecipe } = await import('./recipe-loader')
  const loaded = await loadRecipe(domain, platform, version)
  const runtime = extractYamlDeps(loaded.recipe.dependencies, platform)
  const declared = new Map(runtime.map(dependency => [parseDep(dependency), dependency]))
  const graph = await publishedDependencyGraph(declared, platform, bucket, region)
  const paths = await downloadDependencies([...graph.values()], depsDir, platform, bucket, region)
  return [...graph.keys()].map((child) => {
    const prefix = paths[`deps.${child}.prefix`]
    const version = paths[`deps.${child}.version`]
    if (!prefix || !version) throw new Error(`Unresolved declared runtime package: ${child}`)
    return { domain: parseDep(child), version, prefix }
  })
}

async function buildPackage(options: BuildOptions): Promise<void> {
  const { package: pkgName, version, platform, buildDir, prefix, depsDir, bucket, region } = options
  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Building ${pkgName} ${version} for ${platform}`)
  console.log(`${'='.repeat(60)}`)

  // Get package metadata from src/packages/*.ts (uses reverse domain lookup for collision-resolved keys)
  const pkg = lookupPantryPackage(pkgName)

  if (!pkg) {
    throw new Error(`Package not found in src/packages: ${pkgName} (key: ${domainToKey(pkgName)})`)
  }

  console.log(`\nPackage: ${pkg.name} (${pkg.domain})`)
  console.log(`Description: ${pkg.description}`)
  console.log(`Available versions: ${pkg.versions.length}`)

  // Validate version is available (warn but allow unknown versions for dev builds)
  if (!pkg.versions.includes(version)) {
    console.log(`\nAvailable versions: ${pkg.versions.slice(0, 10).join(', ')}...`)
    console.log(`⚠️  Version ${version} not in TS definition — proceeding anyway (may be a dev/pre-release version)`)
  }

  // Show dependencies
  if (pkg.dependencies?.length > 0) {
    console.log(`\nRuntime dependencies: ${pkg.dependencies.length}`)
    pkg.dependencies.slice(0, 5).forEach((d: string) => console.log(`  - ${d}`))
    if (pkg.dependencies.length > 5) console.log(`  ... and ${pkg.dependencies.length - 5} more`)
  }

  if (pkg.buildDependencies?.length > 0) {
    console.log(`\nBuild dependencies: ${pkg.buildDependencies.length}`)
    pkg.buildDependencies.forEach((d: string) => console.log(`  - ${d}`))
  }

  // Load recipe: tries src/recipes/*.ts first, then YAML + overrides
  const { loadRecipe } = await import('./recipe-loader')
  const loaded = await loadRecipe(pkgName, platform, version)
  console.log(`Build recipe: ${loaded.yamlPath || 'native TS recipe'} (source: ${loaded.source})`)

  const recipe = loaded.recipe as PackageRecipe

  // For native recipes, synthesize yamlContent for version tag resolution
  // (the version.tag machinery reads YAML strip patterns)
  const yamlContent = loaded.yamlPath && loaded.source !== 'recipe'
    ? readFileSync(loaded.yamlPath, 'utf-8')
    : '' // Native recipes don't need YAML content — version.tag defaults to v{version}

  // Helper to safely get build deps from the (possibly union-typed) build field
  const getBuildDeps = (r: PackageRecipe) => {
    const b = r.build
    return (b && typeof b === 'object' && !Array.isArray(b)) ? b.dependencies : undefined
  }

  // Capture dep domains BEFORE overrides to detect removals
  const preOverrideRuntimeDeps = new Set(extractYamlDeps(recipe.dependencies, platform).map(d => parseDep(d)))
  const preOverrideBuildDeps = new Set(extractYamlDeps(getBuildDeps(recipe), platform).map(d => parseDep(d)))

  // After loadRecipe, build is already normalized (overrides applied if YAML source)
  const normalizedRecipe = recipe as NormalizedRecipe

  // Compute deps removed by modifyRecipe overrides
  const postOverrideRuntimeDeps = new Set(extractYamlDeps(normalizedRecipe.dependencies, platform).map(d => parseDep(d)))
  const postOverrideBuildDeps = new Set(extractYamlDeps(normalizedRecipe.build?.dependencies, platform).map(d => parseDep(d)))
  const removedDeps = new Set<string>()
  for (const d of preOverrideRuntimeDeps) if (!postOverrideRuntimeDeps.has(d)) removedDeps.add(d)
  for (const d of preOverrideBuildDeps) if (!postOverrideBuildDeps.has(d)) removedDeps.add(d)

  const yamlBuildDeps = extractYamlDeps(normalizedRecipe.build?.dependencies, platform)
  const yamlRuntimeDeps = extractYamlDeps(normalizedRecipe.dependencies, platform)
  if (yamlBuildDeps.length > 0) {
    console.log(`\nYAML build dependencies: ${yamlBuildDeps.join(', ')}`)
  }

  // Download dependencies from S3 if bucket is provided
  let depPaths: Record<string, string> = {}
  let runtimePackages: RuntimePackage[] = []
  if (bucket && region && depsDir) {
    // Merge TS metadata deps + YAML deps (deduplicate by domain)
    // Filter out deps that were explicitly removed by modifyRecipe overrides
    // When both build and runtime deps specify constraints for the same domain,
    // merge them into a compound constraint (e.g., ">=2.3" + "<4" → ">=2.3<4")
    const declared = collectBuildDependencies(pkg, yamlBuildDeps, yamlRuntimeDeps, removedDeps)
    const runtimeDeclared = collectBuildDependencies({ dependencies: pkg.dependencies }, [], yamlRuntimeDeps, removedDeps)
    const installed = await installBuildDependencyGraphs(runtimeDeclared, declared, depsDir,
      initial => publishedDependencyGraph(initial, platform, bucket, region),
      (graph, directory) => downloadDependencies([...graph.values()], directory, platform, bucket, region))
    depPaths = installed.depPaths
    runtimePackages = installed.runtimePackages

    console.log(`\nDownloaded ${Object.keys(depPaths).filter(k => k.endsWith('.prefix')).length} dependencies (including transitive)`)
  }

  // Create directories
  mkdirSync(buildDir, { recursive: true })
  mkdirSync(prefix, { recursive: true })

  // Copy props to build dir: sibling files of package.yml become buildDir/props/
  // For native recipes, use the loaded.propsDir if available
  const packageDir = loaded.propsDir || (loaded.yamlPath ? dirname(loaded.yamlPath) : null)
  if (packageDir && existsSync(packageDir)) {
    const destProps = join(buildDir, 'props')
    const siblings = readdirSync(packageDir).filter(f => f !== 'package.yml' && !f.endsWith('.ts'))
    if (siblings.length > 0) {
      mkdirSync(destProps, { recursive: true })
      for (const entry of siblings) {
        const srcPath = join(packageDir, entry)
        execSync(`cp -a "${srcPath}" "${destProps}/"`, { stdio: 'pipe' })
      }
      console.log(`📋 Copied ${siblings.length} props files to build dir: ${siblings.join(', ')}`)
    }
  }

  // Determine version.tag from the versions.strip pattern in YAML
  // In pkgx, version.tag is the original git tag before strip was applied
  // Default strip for github: sources is /^v/ — but only if tag actually has v prefix
  let versionTag = determineVersionTag(yamlContent, version)
  let versionRaw = version

  // For URLs using version.tag or version.raw, resolve the actual GitHub tag via API
  // This handles leading-zero normalization (e.g. 2026.2.9.0 → v2026.02.09.00)
  let rawDistUrl = typeof recipe.distributable?.url === 'string' ? recipe.distributable.url : ''
  const rawDistRef = typeof recipe.distributable?.ref === 'string' ? recipe.distributable.ref : ''
  // Also check array distributable entries for version.tag usage
  if (!rawDistUrl && Array.isArray(recipe.distributable)) {
    for (const entry of recipe.distributable) {
      if (entry?.url && typeof entry.url === 'string') {
        rawDistUrl = entry.url
        break
      }
    }
  }
  // Also check if build scripts use version.tag (vendored packages like tart.run)
  const buildScriptsUseVersionTag = (() => {
    const scripts = normalizedRecipe.build?.script
    if (!scripts || !Array.isArray(scripts)) return false
    return scripts.some((s: string | RecipeScriptStep) => {
      const run = typeof s === 'string' ? s : (typeof s === 'object' && 'run' in s ? s.run : '')
      const text = typeof run === 'string' ? run : Array.isArray(run) ? run.join(' ') : ''
      return text.includes('version.tag') || text.includes('version.raw')
    })
  })()
  if (rawDistUrl.includes('version.tag') || rawDistUrl.includes('version.raw')
    || rawDistRef.includes('version.tag') || rawDistRef.includes('version.raw')
    || buildScriptsUseVersionTag) {
    console.log(`🔍 Resolving GitHub tag for version ${version} (URL uses version.tag/raw)...`)
    const resolved = await resolveGitHubTag(yamlContent, version, rawDistUrl)
    if (resolved) {
      versionTag = resolved.tag
      versionRaw = resolved.rawVersion
      console.log(`📌 Resolved GitHub tag: ${resolved.tag} (raw: ${resolved.rawVersion})`)
    }
else {
      console.log(`⚠️  Could not resolve GitHub tag for ${version}, using heuristic: ${versionTag}`)
    }
  }

  // Setup template variables
  const cpuCount = (await import('node:os')).cpus().length
  const vMajor = version.split('.')[0]
  const vMinor = version.split('.')[1] || '0'
  const templateVars: Record<string, string> = {
    'version': version,
    'version.raw': versionRaw,
    'version.tag': versionTag,
    'version.major': vMajor,
    'version.minor': vMinor,
    'version.patch': version.split('.')[2] || '0',
    'version.marketing': `${vMajor}.${vMinor}`,
    'prefix': prefix,
    'hw.concurrency': String(cpuCount),
    'hw.arch': (arch === 'arm64' || arch === 'aarch64') ? 'aarch64' : 'x86-64',
    'hw.platform': osName,
    'hw.target': `${(arch === 'arm64' || arch === 'aarch64') ? 'aarch64' : 'x86-64'}-${osName}`,
    'srcroot': buildDir,
    'pkgx.prefix': prefix,
    'pkgx.dir': prefix,
    ...depPaths, // Add dependency paths for template interpolation
  }

  // Normalize bare-string distributable to object form
  // Some YAML files have `distributable: https://...` (bare string) instead of `distributable: { url: "..." }`
  if (typeof recipe.distributable === 'string') {
    recipe.distributable = { url: recipe.distributable }
  }

  // Download source
  if (Array.isArray(recipe.distributable)) {
    // Array-format distributable (e.g. sqlite.org) — try each URL until one works
    let downloaded = false
    for (const entry of recipe.distributable) {
      if (!entry.url) continue
      const rawUrl = typeof entry.url === 'string' ? entry.url : String(entry.url)
      const sourceUrl = interpolate(rawUrl, templateVars)
      const isZipUrl = rawUrl.endsWith('.zip') || sourceUrl.endsWith('.zip')
      const stripComponents = entry['strip-components'] ?? (isZipUrl ? 0 : 1)
      const ref = entry.ref ? interpolate(entry.ref, templateVars) : undefined
      try {
        console.log(`📥 Trying distributable URL: ${sourceUrl}`)
        await downloadSource(sourceUrl, buildDir, stripComponents, ref, pkgName, version)
        downloaded = true
        break
      }
catch {
        console.log(`   ⚠️  Failed, trying next URL...`)
      }
    }
    if (!downloaded) {
      throw new Error(`All distributable URLs failed for ${pkgName}@${version}`)
    }
  }
else if (recipe.distributable?.url) {
    const rawUrl = typeof recipe.distributable.url === 'string' ? recipe.distributable.url : String(recipe.distributable.url)
    const sourceUrl = interpolate(rawUrl, templateVars)
    // Default strip-components: 1 for tar (standard), 0 for zip (many recipes expect outer dir)
    const isZipUrl = rawUrl.endsWith('.zip') || sourceUrl.endsWith('.zip')
    const stripComponents = recipe.distributable['strip-components'] ?? (isZipUrl ? 0 : 1)
    const ref = recipe.distributable.ref ? interpolate(recipe.distributable.ref, templateVars) : undefined

    try {
      await downloadSource(sourceUrl, buildDir, stripComponents, ref, pkgName, version)
    }
catch (firstError: unknown) {
      let recovered = false

      // Retry 1: If URL or ref used version.tag and download failed, try alternate tag format
      const rawRef = typeof recipe.distributable?.ref === 'string' ? recipe.distributable.ref : ''
      if (!recovered && (rawUrl.includes('version.tag') || rawRef.includes('version.tag')) && versionTag.startsWith('v')) {
        console.log(`⚠️  Download failed with tag ${versionTag}, retrying without v prefix...`)
        const altTag = version
        const altVars = { ...templateVars, 'version.tag': altTag }
        const altUrl = interpolate(rawUrl, altVars)
        const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
        try {
          await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
          templateVars['version.tag'] = altTag
          recovered = true
        }
catch { /* continue to next retry */ }
      }

      // Retry 2: If version ends in .0, strip trailing .0 components
      // First try stripping one .0, then strip ALL trailing .0s (e.g., 20251022.0.0 → 20251022)
      if (!recovered && version.endsWith('.0') && version.split('.').length >= 3) {
        const shortVersion = version.replace(/\.0$/, '')
        console.log(`⚠️  Download failed, retrying with shortened version ${shortVersion}...`)
        const altVars = {
          ...templateVars,
          'version': shortVersion,
          'version.raw': shortVersion,
          'version.tag': determineVersionTag(yamlContent, shortVersion),
          'version.marketing': shortVersion.split('.').slice(0, 2).join('.'),
          'version.patch': '0',
        }
        const altUrl = interpolate(rawUrl, altVars)
        const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
        try {
          await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
          Object.assign(templateVars, altVars)
          recovered = true
        }
catch { /* continue to next retry */ }
      }

      // Retry 3: Strip ALL trailing .0 components (e.g., 20251022.0.0 → 20251022)
      if (!recovered && version.includes('.0')) {
        const fullyStripped = version.replace(/(?:\.0)+$/, '')
        if (fullyStripped !== version && fullyStripped !== version.replace(/\.0$/, '')) {
          console.log(`⚠️  Download failed, retrying with fully stripped version ${fullyStripped}...`)
          const altVars = {
            ...templateVars,
            'version': fullyStripped,
            'version.raw': fullyStripped,
            'version.tag': determineVersionTag(yamlContent, fullyStripped),
            'version.marketing': fullyStripped.split('.').slice(0, 2).join('.'),
            'version.patch': '0',
          }
          const altUrl = interpolate(rawUrl, altVars)
          const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
          try {
            await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
            Object.assign(templateVars, altVars)
            recovered = true
          }
catch { /* continue to next retry */ }
        }
      }

      // Retry 4: If version.tag was used with v prefix and version also ends in .0
      if (!recovered && rawUrl.includes('version.tag') && versionTag.startsWith('v') && version.endsWith('.0')) {
        const shortVersion = version.replace(/\.0$/, '')
        console.log(`⚠️  Download failed, retrying with shortened version v${shortVersion}...`)
        const altVars = {
          ...templateVars,
          'version': shortVersion,
          'version.raw': shortVersion,
          'version.tag': `v${shortVersion}`,
          'version.marketing': shortVersion.split('.').slice(0, 2).join('.'),
          'version.patch': '0',
        }
        const altUrl = interpolate(rawUrl, altVars)
        const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
        try {
          await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
          Object.assign(templateVars, altVars)
          recovered = true
        }
catch { /* all retries exhausted */ }
      }

      // Retry 5: For alternation strip patterns, try each alternative as version.tag
      if (!recovered && rawUrl.includes('version.tag')) {
        const stripMatch = yamlContent.match(/strip:\s*\/(.+)\/$/) ?? yamlContent.match(/strip:\s*\/(.+)\//)
        if (stripMatch && stripMatch[1].includes('|')) {
          const pattern = stripMatch[1]
          const alts = pattern.replace(/^\(/, '').replace(/\)$/, '').split('|')
          for (const alt of alts) {
            if (recovered) break
            const altPrefix = alt.replace(/^\^/, '')
            const altTag = altPrefix + version
            if (altTag === versionTag) continue // Already tried
            console.log(`⚠️  Download failed, retrying with alternate version tag: ${altTag}...`)
            const altVars = { ...templateVars, 'version.tag': altTag }
            const altUrl = interpolate(rawUrl, altVars)
            const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
            try {
              await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
              Object.assign(templateVars, altVars)
              recovered = true
            }
catch { /* try next alternative */ }
          }
        }
      }

      // Retry 6: Try zero-padded version components (e.g., 26.2.0 → 26.02.0)
      // Handles date-based versioning where month is zero-padded (YY.MM.PATCH)
      if (!recovered) {
        const parts = version.split('.')
        if (parts.length >= 2) {
          for (let i = 1; i < parts.length; i++) {
            if (recovered) break
            const part = parts[i]
            // Only pad single-digit components (1-9) that aren't already padded
            if (/^[1-9]$/.test(part)) {
              const paddedParts = [...parts]
              paddedParts[i] = part.padStart(2, '0')
              const paddedVersion = paddedParts.join('.')
              console.log(`⚠️  Download failed, retrying with zero-padded version ${paddedVersion}...`)
              const altVars = {
                ...templateVars,
                'version': paddedVersion,
                'version.raw': paddedVersion,
                'version.marketing': `${paddedParts[0]}.${paddedParts[1]}`,
              }
              const altUrl = interpolate(rawUrl, altVars)
              const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
              try {
                await downloadSource(altUrl, buildDir, stripComponents, altRef, pkgName, version)
                Object.assign(templateVars, altVars)
                recovered = true
              }
catch { /* try next component */ }
            }
          }
        }
      }

      if (!recovered) {
        throw firstError
      }
    }
  }
else {
    // Vendored packages (distributable: ~) have no source to download.
    // The build script handles fetching (e.g. curl from GitHub releases).
    // Just ensure the source directory exists for the build script to run in.
    console.log('📦 No distributable URL — vendored package, skipping source download')
    mkdirSync(buildDir, { recursive: true })
  }

  // Build environment variables
  const buildEnv: Record<string, string> = {
    prefix,
    PREFIX: prefix,
  }

  // Process env section
  if (normalizedRecipe.build?.env) {
    const env = normalizedRecipe.build.env

    // Process ARGS
    let args: string[] = []
    if (env.ARGS) {
      args = Array.isArray(env.ARGS) ? env.ARGS : [env.ARGS]
    }

    // Add platform-specific ARGS
    if (env[osName]?.ARGS) {
      const platformArgs = Array.isArray(env[osName].ARGS) ? env[osName].ARGS : [env[osName].ARGS]
      args.push(...platformArgs)
    }

    // Apply build overrides from build-overrides.json (if any)
    const overrides = getBuildOverrides(pkgName)
    if (overrides?.extraConfigureArgs?.length) {
      console.log(`🔧 Applying build overrides for ${pkgName}: ${overrides.description || 'custom args'}`)
      args.push(...overrides.extraConfigureArgs)
    }

    // Interpolate ARGS
    buildEnv.ARGS = args.map(arg => interpolate(arg, templateVars)).join(' ')

    // Process other env vars
    for (const [key, value] of Object.entries(env)) {
      if (key === 'ARGS' || key === 'darwin' || key === 'linux' || key.includes('/')) continue

      if (typeof value === 'string') {
        buildEnv[key] = interpolate(value, templateVars)
      }
else if (Array.isArray(value)) {
        buildEnv[key] = value.map(v => interpolate(v, templateVars)).join(' ')
      }
    }

    // Process platform-specific env vars
    const platformEnv = env[osName]
    if (platformEnv) {
      for (const [key, value] of Object.entries(platformEnv)) {
        if (key === 'ARGS') continue

        if (typeof value === 'string') {
          buildEnv[key] = interpolate(value, templateVars)
        }
else if (Array.isArray(value)) {
          buildEnv[key] = value.map((v: string) => interpolate(v, templateVars)).join(' ')
        }
      }
    }

    // Process arch-specific env vars keyed `os/arch` (e.g. pkgx's
    // `darwin/aarch64: { ARCH: darwin64-arm64-cc }`). These are skipped by the
    // generic loop above (slash keys) and the osName loop, yet are essential
    // for recipes whose configure target depends on the CPU arch (openssl etc.).
    const normalizedArch = (arch === 'arm64' || arch === 'aarch64') ? 'aarch64' : 'x86-64'
    const archEnv = env[`${osName}/${normalizedArch}`]
    if (archEnv && typeof archEnv === 'object') {
      for (const [key, value] of Object.entries(archEnv as Record<string, string | string[]>)) {
        const joined = Array.isArray(value)
          ? value.map(v => interpolate(String(v), templateVars)).join(' ')
          : interpolate(String(value), templateVars)
        if (key === 'ARGS') {
          buildEnv.ARGS = buildEnv.ARGS ? `${buildEnv.ARGS} ${joined}` : joined
        }
        else {
          buildEnv[key] = joined
        }
      }
    }
  }

  console.log('\n📋 Build environment:')
  for (const [key, value] of Object.entries(buildEnv)) {
    if (key === 'ARGS') {
      console.log(`   ${key}: ${value.slice(0, 80)}${value.length > 80 ? '...' : ''}`)
    }
else {
      console.log(`   ${key}: ${value}`)
    }
  }

  // Generate and execute build script from YAML recipe (buildkit)
  console.log('\n🔨 Generating build script from YAML recipe...')

  const bashScript = generateBuildScript(
    recipe as PackageRecipe,
    pkgName,
    version,
    platform,
    prefix,
    buildDir,
    depPaths,
    templateVars['version.tag'],
  )

  const scriptPath = join(buildDir, '_build.sh')
  writeFileSync(scriptPath, bashScript, { mode: 0o755 })

  console.log(`📝 Build script written to ${scriptPath}`)
  // Diagnostic: show if cargo is in the PATH being passed to the build script
  const pathEntries = (process.env.PATH || '').split(':')
  const cargoInPath = pathEntries.some(p => p.includes('.cargo'))
  console.log(`   [diag] cargo in process.env.PATH: ${cargoInPath}${cargoInPath ? ` (${pathEntries.find(p => p.includes('.cargo'))})` : ''}`)
  console.log('\n🔨 Executing build script...')

  try {
    // Use Git Bash on Windows, /bin/bash on Unix
    const bashShell = process.platform === 'win32'
      ? 'C:\\Program Files\\Git\\bin\\bash.exe'
      : '/bin/bash'
    execSync(`"${bashShell}" "${scriptPath}"`, {
      cwd: buildDir,
      env: {
        ...process.env,
        // Only pass basic path vars — buildkit.ts handles all recipe env vars
        // (CFLAGS, LDFLAGS, ARGS, etc.) via export statements in the bash script.
        // Do NOT spread buildEnv here: it contains literal $VAR references from
        // interpolate() that pollute the bash script's variable expansion.
        prefix,
        PREFIX: prefix,
        SRCROOT: buildDir,
      },
      stdio: 'inherit',
      shell: bashShell,
      // Build-script timeout. Raised from 60 to 150 minutes: the 60-minute
      // bound was set after an ETIMEDOUT killed mariadb at 64%, but it was
      // still too tight - mysql.com now compiles for over an hour on a
      // 4-core x86-64 runner and died the same way, having done everything
      // right. The GitHub job it runs inside has no explicit timeout (a
      // 6-hour default), so this is the binding limit and it needs headroom
      // for the heaviest package rather than the typical one.
      // Override with BUILD_SCRIPT_TIMEOUT_MS.
      timeout: Number(process.env.BUILD_SCRIPT_TIMEOUT_MS) || 150 * 60 * 1000,
    })
  }
catch (error: unknown) {
    console.error('❌ Build script failed')
    try {
      const diagnostics = persistBuildDiagnostics({ buildDir, script: bashScript, error, runnerTemp: process.env.RUNNER_TEMP })
      if (diagnostics) console.error(`Sanitized build diagnostics: ${diagnostics}`)
    }
    catch { console.error('Could not save build diagnostics; preserving the original build failure') }
    // A recipe that has established upstream ships nothing for this
    // platform/version says so by exiting 42, the same code this process uses
    // for its own download failures. That is a phantom version, not a build
    // failure: it must not count against coverage, and the caller should try
    // an older version rather than give up on the package.
    //
    // Without it the only signal was a 404 in the script's stderr, which works
    // for a recipe that lets curl fail but not for one that checks several
    // candidate assets and reports the miss itself — postgrest.org and
    // haskell.org/cabal both do exactly that.
    if ((error as { status?: number }).status === DOWNLOAD_FAILURE_EXIT_CODE)
      (error as Error & { _downloadFailure?: boolean })._downloadFailure = true
    // Dump config.log if it exists (key for diagnosing "C compiler cannot create executables")
    const configLog = join(buildDir, 'config.log')
    if (existsSync(configLog)) {
      const logContent = readFileSync(configLog, 'utf-8')
      // Search for the actual compiler test error (not just variable dump at the end)
      const compilerTestIdx = logContent.indexOf('whether the C compiler works')
      if (compilerTestIdx >= 0) {
        // Show 2000 chars around the compiler test
        const start = Math.max(0, compilerTestIdx - 200)
        const end = Math.min(logContent.length, compilerTestIdx + 2000)
        console.error('\n--- config.log (compiler test section) ---')
        console.error(sanitizeBuildDiagnostic(logContent.slice(start, end)))
        console.error('--- End compiler test section ---')
      }
else {
        // Fallback: show last 5000 chars
        const tail = logContent.length > 5000 ? logContent.slice(-5000) : logContent
        console.error('\n--- config.log (tail) ---')
        console.error(sanitizeBuildDiagnostic(tail))
        console.error('--- End config.log ---')
      }
    }
    // Print the generated script for debugging (show last 3000 chars to see user script)
    console.error('\n--- Generated build script (tail) ---')
    const scriptTail = bashScript.length > 3000 ? bashScript.slice(-3000) : bashScript
    console.error(sanitizeBuildDiagnostic(scriptTail))
    console.error('--- End script ---')
    throw error
  }

  // Post-build fix-ups for relocatable binaries
  console.log('\n🔧 Running post-build fix-ups...')
  const skips = getSkips(recipe as PackageRecipe)
  selectPublishedFiles(prefix, normalizedRecipe.publish?.include)
  writeProgramInterfaces(prefix, normalizedRecipe.sourceablePrograms)
  await fixUp(prefix, platform, skips, runtimePackages)

  console.log(`\n✅ Build completed successfully!`)
  console.log(`📁 Installed to: ${prefix}`)

  // List what was installed
  try {
    const installed = execSync(`ls -la "${prefix}"`, { encoding: 'utf-8' })
    console.log('\n📦 Installed contents:')
    console.log(installed)
  }
catch {
    // Ignore errors listing directory
  }

  // Run health check / test from the recipe (if defined).
  //
  // Cross-platform download fanout: when building a FOREIGN target (e.g. a
  // linux-arm64 download recipe on a darwin-arm64 host), we cannot execute the
  // installed binary, so the recipe's `test` (which runs `foo --version`) would
  // fail spuriously. For foreign targets we SKIP execution and instead run
  // `verifyForeignArtifact`, which inspects the installed binaries with `file`
  // and asserts the magic matches the target os/arch. That check THROWS on
  // failure so a bad foreign artifact (failed download/extract, arch-mapping
  // bug) is caught here, before build-all-packages.ts packages/uploads it.
  const hostPlatform = getHostPlatform()
  const [tgtOs, tgtArch] = normalizePlatform(platform)
  const [hostOs, hostArch] = normalizePlatform(hostPlatform)
  const isForeignTarget = tgtOs !== hostOs || tgtArch !== hostArch

  if (isForeignTarget) {
    console.log(`\n⏭️  foreign target ${platform} on host ${hostPlatform}: skipping execution health-check, verifying artifact instead`)
    if (skips.includes('verify-foreign-artifact')) {
      verifyForeignInstallPresent(prefix, platform)
    }
    else {
      // verifyForeignArtifact throws on failure — propagate so the build fails and
      // nothing bad gets packaged/uploaded.
      verifyForeignArtifact(prefix, platform)
    }
  }
else if (recipe.test) {
    console.log('\n🧪 Running health check...')
    try {
      runHealthCheck(recipe.test, prefix, templateVars, depPaths, platform)
      console.log('✅ Health check passed!')
    }
catch (error: unknown) {
      if (isRequiredHealthCheck(recipe.test))
        throw error

      console.error(`⚠️  Health check failed: ${(error as Error).message}`)
      // Health check failure is a warning, not a build failure.
      // The binary is still functional — the test may have external deps
      // or network requirements that aren't available in CI.
    }
  }
}

/**
 * Compute the HOST platform string (matching the `--platform` format, e.g.
 * `darwin-arm64`, `linux-x86-64`) from the current process.
 */
function getHostPlatform(): string {
  const hostOs = process.platform === 'darwin' ? 'darwin' : 'linux'
  const procArch = String(process.arch)
  const hostArch = (procArch === 'arm64' || procArch === 'aarch64') ? 'aarch64' : 'x86-64'
  return `${hostOs}-${hostArch}`
}

/**
 * Parse a `<os>-<arch>` platform string into a normalized [os, arch] tuple.
 * os ∈ {darwin, linux}; arch ∈ {aarch64, x86-64}. Accepts `arm64`/`aarch64`
 * for ARM and anything else maps to `x86-64`.
 */
function normalizePlatform(platform: string): [string, string] {
  const [rawOs, ...rest] = platform.split('-')
  const rawArch = rest.join('-')
  const os = rawOs === 'darwin' ? 'darwin' : 'linux'
  const arch = (rawArch === 'arm64' || rawArch === 'aarch64') ? 'aarch64' : 'x86-64'
  return [os, arch]
}

/**
 * Verify a FOREIGN-target install without executing it. Globs binaries under
 * {{prefix}}/bin and {{prefix}}/sbin, then runs `file -L` (follow symlinks, so
 * the helix/powershell libexec+symlink pattern resolves to the real binary) and
 * asserts at least one binary's magic matches the TARGET os/arch.
 *
 * Throws if the install produced no files (download/extract failed) or if no
 * installed binary matches the expected magic (catches arch-mapping bugs — the
 * main risk of cross-building). Tolerates non-binary helpers (scripts, data).
 */
/**
 * How many distinct machine architectures appear across these `file` outputs.
 *
 * A wrong download yields one. A bundle shipped for many platforms yields
 * many, and that difference is the whole basis for telling them apart.
 */
export function distinctArchitectures(inspected: Array<{ out: string }>): number {
  // Matched against what `file -bL` actually prints, taken from cassandra's own
  // sigar bundle rather than guessed: "64-bit PowerPC or cisco 7500", "SPARC",
  // "Intel 80386", "64-bit XCOFF executable" — the human names, not the tuple
  // spellings in the filenames.
  const ARCHITECTURES: Array<[RegExp, string]> = [
    [/\bx86[-_]64\b/i, 'x86-64'],
    [/\bIntel 80386\b|\bi386\b/i, 'i386'],
    [/\baarch64\b|\bARM aarch64\b/i, 'aarch64'],
    [/\barm64\b/i, 'arm64'],
    [/\bARM\b(?!\s*aarch64)/i, 'arm'],
    [/\bPowerPC\b|\bppc\b/i, 'powerpc'],
    [/\bSPARC\b/i, 'sparc'],
    [/\bIA-?64\b|\bItanium\b/i, 'ia64'],
    [/\bXCOFF\b/i, 'xcoff'],
    [/\bS\/390\b|\bs390x\b/i, 's390x'],
    [/\bMIPS\b/i, 'mips'],
    [/\bRISC-?V\b/i, 'riscv'],
    [/\bPA-RISC\b/i, 'parisc'],
  ]
  const seen = new Set<string>()
  for (const { out } of inspected) {
    for (const [pattern, name] of ARCHITECTURES) {
      if (pattern.test(out)) {
        seen.add(name)
        break
      }
    }
  }
  return seen.size
}

export function verifyForeignArtifact(prefix: string, platform: string): void {
  const candidates = foreignInstallCandidates(prefix)
  if (candidates.length === 0)
    throw new Error(`verifyForeignArtifact: no non-empty files found under ${prefix}; the download/extract for ${platform} produced nothing`)

  const [os, arch] = normalizePlatform(platform)

  // Expected magic substrings for the target os/arch.
  const expectFormat = os === 'darwin' ? 'Mach-O' : 'ELF'
  const expectArch = os === 'darwin'
    ? (arch === 'aarch64' ? ['arm64'] : ['x86_64'])
    : (arch === 'aarch64' ? ['aarch64', 'ARM aarch64'] : ['x86-64', 'x86_64'])

  let matched: { path: string, out: string } | undefined
  const inspected = inspectForeignCandidates(candidates)
  for (const item of inspected) {
    if (item.out.includes(expectFormat) && expectArch.some(a => item.out.includes(a))) {
      matched = item
      break
    }
  }

  const nativeArtifacts = inspected.filter(item => item.out.includes('Mach-O') || item.out.includes('ELF'))
  if (!matched && nativeArtifacts.length === 0) {
    console.log(`🔎 foreign-target sanity: ${platform} installed ${inspected.length} platform-independent data file(s) (OK)`)
    return
  }

  // A deliberate multi-architecture bundle is not a wrong download.
  //
  // This check exists to catch an arch-mapping bug, and such a bug produces
  // native files of exactly ONE architecture — the one we fetched by mistake.
  // A package that ships several at once is doing something else on purpose:
  // cassandra.apache.org bundles lib/sigar-bin/libsigar-{amd64-linux,
  // ppc64-aix,ia64-linux,…}.so, none of which matches darwin-arm64, while its
  // actual programs (bin/cassandra, bin/nodetool, bin/cqlsh) are shell and
  // Python scripts. Demanding a target match there rejected a correct artifact.
  //
  // Counting distinct architectures is what separates the two, so this stays
  // strict about the case it was written for: one foreign arch still fails.
  if (!matched && distinctArchitectures(nativeArtifacts) >= 3) {
    console.log(
      `🔎 foreign-target sanity: ${platform} installed a multi-architecture native bundle `
      + `(${nativeArtifacts.length} files, ${distinctArchitectures(nativeArtifacts)} architectures) `
      + 'alongside platform-independent programs (OK)',
    )
    return
  }

  if (!matched) {
    console.error(`❌ foreign-target sanity FAILED for ${platform}: no installed binary matches ${expectFormat} + [${expectArch.join(', ')}]`)
    for (const { path, out } of inspected)
      console.error(`   - ${path} → ${out}`)
    throw new Error(`verifyForeignArtifact: no installed binary under ${prefix} matches the expected ${platform} magic (${expectFormat} + [${expectArch.join(', ')}]) — likely an arch-mapping or download bug`)
  }

  console.log(`🔎 foreign-target sanity: ${matched.path} → ${matched.out} (OK)`)
}

function foreignInstallCandidates(prefix: string): string[] {
  const candidates = new Set(foreignArtifactCandidates(prefix))
  const pending = [prefix]

  while (pending.length > 0) {
    const directory = pending.pop()!
    let entries: string[] = []
    try { entries = readdirSync(directory) }
    catch { continue }

    for (const name of entries) {
      const path = join(directory, name)
      try {
        const stats = statSync(path)
        if (stats.isDirectory())
          pending.push(path)
        else if (stats.isFile() && stats.size > 0)
          candidates.add(path)
      }
      catch { /* skip dangling symlinks and unreadable entries */ }
    }
  }

  return [...candidates]
}

function verifyForeignInstallPresent(prefix: string, platform: string): void {
  const candidates = foreignArtifactCandidates(prefix)
  if (candidates.length === 0)
    throw new Error(`verifyForeignInstallPresent: no non-empty launchers found under ${prefix}/bin or ${prefix}/sbin — the download/extract for ${platform} produced nothing`)

  const inspected = inspectForeignCandidates(candidates)
  console.log(`🔎 foreign-target sanity: ${platform} installed ${inspected.length} launcher(s); recipe opted out of ELF/Mach-O magic check`)
  for (const { path, out } of inspected.slice(0, 8))
    console.log(`   - ${path} → ${out}`)
}

function foreignArtifactCandidates(prefix: string): string[] {
  const candidates: string[] = []
  for (const sub of ['bin', 'sbin']) {
    const dir = join(prefix, sub)
    if (!existsSync(dir))
      continue
    let entries: string[] = []
    try { entries = readdirSync(dir) }
    catch { continue }
    for (const name of entries) {
      const p = join(dir, name)
      try {
        // statSync follows symlinks — a dangling symlink throws and is skipped.
        const st = statSync(p)
        if (st.isFile() && st.size > 0)
          candidates.push(p)
      }
catch {
        // Skip dangling symlinks / unreadable entries.
      }
    }
  }

  // GUI .app bundles ship no bin/ of their own — accept the app's main Mach-O
  // executable so a signed/notarized desktop app (DMG or zip recipe) passes the
  // foreign-artifact check without needing a synthetic bin shim. Scan the prefix
  // for top-level *.app bundles and add their Contents/MacOS/* executables.
  let appEntries: string[] = []
  try { appEntries = readdirSync(prefix) }
  catch { appEntries = [] }
  for (const name of appEntries) {
    if (!name.endsWith('.app'))
      continue
    const macosDir = join(prefix, name, 'Contents', 'MacOS')
    let exes: string[] = []
    try { exes = readdirSync(macosDir) }
    catch { continue }
    for (const exe of exes) {
      const p = join(macosDir, exe)
      try {
        const st = statSync(p)
        if (st.isFile() && st.size > 0)
          candidates.push(p)
      }
      catch { /* skip non-files / unreadable entries */ }
    }
  }

  return candidates
}

function inspectForeignCandidates(candidates: string[]): Array<{ path: string, out: string }> {
  const inspected: Array<{ path: string, out: string }> = []
  for (const p of candidates) {
    let out = ''
    try {
      // -b: brief, -L: follow symlinks so we inspect the real binary, not the link.
      out = execSync(`file -bL "${p}"`, { encoding: 'utf-8' }).trim()
    }
catch (e) {
      out = `(file failed: ${(e as Error).message})`
    }
    inspected.push({ path: p, out })
  }
  return inspected
}

// CLI entry point
async function main() {
  const { values } = parseArgs({
    options: {
      package: { type: 'string', short: 'p' },
      version: { type: 'string', short: 'v' },
      platform: { type: 'string' },
      'build-dir': { type: 'string' },
      prefix: { type: 'string' },
      'deps-dir': { type: 'string' },
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
    },
    strict: true,
  })

  if (!values.package || !values.version || !values.platform || !values['build-dir'] || !values.prefix) {
    console.error('Usage: build-package.ts --package <domain> --version <version> --platform <platform> --build-dir <dir> --prefix <dir> [--deps-dir <dir>] [--bucket <name>] [--region <region>]')
    console.error('Example: build-package.ts --package php.net --version 8.4.11 --platform darwin-arm64 --build-dir /tmp/build --prefix /tmp/install')
    console.error('With S3: build-package.ts --package php.net --version 8.4.11 --platform darwin-arm64 --build-dir /tmp/build --prefix /tmp/install --deps-dir /tmp/deps --bucket my-bucket')
    process.exit(1)
  }

  // Report live build status to the registry dashboard so any build — a one-off
  // `build-package.ts` run, a local publish, CI, the Hetzner driver — shows up
  // on /packages. Suppressed when build-all-packages.ts already reports for us.
  const reportSelf = process.env.PANTRY_REPORTED_BY_PARENT !== '1'
  if (reportSelf)
    reportBuild(values.package, values.version, values.platform, 'building', { message: `building ${values.version} on ${values.platform}` })

  try {
    await buildPackage({
      package: values.package,
      version: values.version,
      platform: values.platform,
      buildDir: values['build-dir'],
      prefix: values.prefix,
      depsDir: values['deps-dir'],
      bucket: values.bucket,
      region: values.region,
    })
    if (reportSelf)
      await reportBuild(values.package, values.version, values.platform, 'built')
  }
  catch (error) {
    if (reportSelf) {
      const err = error as Error & { _downloadFailure?: boolean }
      // await so the event flushes before main().catch calls process.exit().
      await reportBuild(values.package, values.version, values.platform, 'failed', { error: err.message })
    }
    throw error
  }
}

/**
 * Exit code meaning "the source for this version does not exist upstream".
 *
 * Distinct from 1 (a genuine build failure) because the two need opposite
 * responses: a phantom version should fall back to an older one and not count
 * against coverage, while a build failure should stop and be reported.
 * Recipes may return it themselves; see the build-script catch above.
 */
export const DOWNLOAD_FAILURE_EXIT_CODE = 42

if (import.meta.main) {
  main().catch((error: unknown) => {
    const err = error as Error & { _downloadFailure?: boolean }
    console.error('❌ Build failed:', err.message)
    // Exit code 42 = download failure (source 404/unavailable) — signals version fallback should try older versions
    // Exit code 1 = build/other failure — no point trying older versions
    if (err._downloadFailure) {
      process.exit(DOWNLOAD_FAILURE_EXIT_CODE)
    }
    process.exit(1)
  })
}
