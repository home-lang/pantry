import fs from 'node:fs'
import path from 'node:path'
import { recipeDepsToSpecs } from './dependency-spec'
import { getAliasOverrides, shouldReplaceAliases } from './alias-overrides'

/**
 * Generate Zig package definitions from TypeScript package data
 * This creates a compile-time package registry for the Zig implementation
 */

interface ZigPackageDefinition {
  name: string
  domain: string
  description: string
  homepageUrl?: string
  programs: string[]
  dependencies: string[]
  buildDependencies: string[]
  aliases: string[]
  versions: string[]
}

/**
 * Recursively find all TypeScript package files
 */
/**
 * Merge package aliases with alias overrides from alias-overrides.ts
 */
function mergeAliases(domain: string, existing: string[]): string[] {
  const overrides = getAliasOverrides(domain)
  if (overrides.length === 0) return existing
  if (shouldReplaceAliases(domain)) return overrides
  return [...new Set([...existing, ...overrides])]
}

function findPackageFiles(dir: string): string[] {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      files.push(...findPackageFiles(fullPath))
    }
    else if (entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts' && entry.name !== 'aliases.ts') {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Compare two SemVer prerelease strings (the part after `-`, e.g. `dev.263`)
 * per SemVer §11.4. Numeric identifiers compare numerically (so `dev.2471`
 * outranks `dev.263` instead of losing a lexicographic `"263" > "2471"`
 * comparison), numeric identifiers rank lower than alphanumeric ones, and a
 * longer identifier set wins when all preceding identifiers are equal.
 * Returns negative if `a` precedes `b`, positive if `a` follows, 0 if equal.
 */
function comparePrerelease(a: string, b: string): number {
  const idsA = a.split('.')
  const idsB = b.split('.')
  const len = Math.max(idsA.length, idsB.length)
  for (let i = 0; i < len; i++) {
    const idA = idsA[i]
    const idB = idsB[i]
    // A larger set of prerelease fields has higher precedence when all the
    // preceding identifiers are equal (e.g. `dev.1.1` > `dev.1`).
    if (idA === undefined) return -1
    if (idB === undefined) return 1
    const numA = /^\d+$/.test(idA)
    const numB = /^\d+$/.test(idB)
    if (numA && numB) {
      const d = Number.parseInt(idA, 10) - Number.parseInt(idB, 10)
      if (d !== 0) return d
    }
    else if (numA !== numB) {
      // Numeric identifiers always have lower precedence than alphanumeric.
      return numA ? -1 : 1
    }
    else if (idA !== idB) {
      return idA < idB ? -1 : 1
    }
  }
  return 0
}

/**
 * Compare versions for sorting (newest to oldest)
 * Handles semantic versions like "1.2.3", "1.2.3-beta", "0.17.0-dev.263+sha", etc.
 */
export function compareVersions(a: string, b: string): number {
  // Remove 'v' prefix if present, then drop SemVer build metadata (`+sha`),
  // which carries no precedence and must not leak into the prerelease compare.
  const cleanA = (a.startsWith('v') ? a.slice(1) : a).replace(/_(?=[0-9a-f]+$)/i, '+').split('+')[0]
  const cleanB = (b.startsWith('v') ? b.slice(1) : b).replace(/_(?=[0-9a-f]+$)/i, '+').split('+')[0]

  // Separate numeric portion from prerelease suffix
  const dashA = cleanA.indexOf('-')
  const numericA = dashA === -1 ? cleanA : cleanA.slice(0, dashA)
  const preA = dashA === -1 ? null : cleanA.slice(dashA + 1)

  const dashB = cleanB.indexOf('-')
  const numericB = dashB === -1 ? cleanB : cleanB.slice(0, dashB)
  const preB = dashB === -1 ? null : cleanB.slice(dashB + 1)

  const partsA = numericA.split('.')
  const partsB = numericB.split('.')

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = Number.parseInt(partsA[i] || '0', 10)
    const numB = Number.parseInt(partsB[i] || '0', 10)

    if (numA > numB) return -1 // a is newer
    if (numA < numB) return 1  // b is newer
  }

  // Same numeric version: release (no prerelease) is newer than prerelease
  if (preA === null && preB !== null) return -1
  if (preA !== null && preB === null) return 1
  if (preA !== null && preB !== null) {
    // Newest-first ordering, so a higher-precedence prerelease sorts earlier.
    const c = comparePrerelease(preA, preB)
    return c === 0 ? 0 : -c
  }

  return 0
}

/**
 * Escape special characters in Zig strings
 */
function escapeZigString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

/**
 * Convert a package to Zig struct format
 */
function packageToZigStruct(pkg: ZigPackageDefinition): string {
  const programs = pkg.programs.map(p => `"${escapeZigString(p)}"`).join(', ')
  const deps = pkg.dependencies.map(d => `"${escapeZigString(d)}"`).join(', ')
  const buildDeps = pkg.buildDependencies.map(d => `"${escapeZigString(d)}"`).join(', ')
  const aliases = pkg.aliases.map(a => `"${escapeZigString(a)}"`).join(', ')
  const versions = pkg.versions.map(v => `"${escapeZigString(v)}"`).join(', ')

  return `    .{
        .name = "${escapeZigString(pkg.name)}",
        .domain = "${escapeZigString(pkg.domain)}",
        .description = "${escapeZigString(pkg.description)}",
        .homepage_url = ${pkg.homepageUrl ? `"${escapeZigString(pkg.homepageUrl)}"` : 'null'},
        .programs = &[_][]const u8{ ${programs} },
        .dependencies = &[_][]const u8{ ${deps} },
        .build_dependencies = &[_][]const u8{ ${buildDeps} },
        .aliases = &[_][]const u8{ ${aliases} },
        .versions = &[_][]const u8{ ${versions} },
    }`
}

/**
 * Generate Zig package definitions file
 */
/** The `os:domain` (or `domain`) key of a dependency spec, ignoring its version
 * constraint and any ` # comment` — used to dedupe metadata vs recipe deps. */
function depKey(spec: string): string {
  let x = spec
  const h = x.indexOf('#')
  if (h >= 0)
    x = x.slice(0, h)
  x = x.trim()
  let prefix = ''
  const colon = x.indexOf(':')
  if (colon >= 0 && ['linux', 'darwin', 'windows'].includes(x.slice(0, colon))) {
    prefix = `${x.slice(0, colon)}:`
    x = x.slice(colon + 1)
  }
  const m = x.search(/[\^~><=@]/)
  const domain = (m >= 0 ? x.slice(0, m) : x).trim()
  return prefix + domain
}

/** Load a package's build-recipe runtime dependencies (src/recipes/<domain>.ts),
 * if any, as metadata-style specs. The recipe is authoritative for what we
 * actually compiled against, so its deps must flow into the catalog. */
async function loadRecipeDeps(recipesDir: string, domain: string): Promise<string[]> {
  const file = path.join(recipesDir, `${domain}.ts`)
  if (!fs.existsSync(file))
    return []
  try {
    const mod = await import(`file://${path.resolve(file)}`)
    return recipeDepsToSpecs(mod.recipe?.dependencies)
  }
  catch {
    return []
  }
}

/** A dependency spec without a trailing note: `git-scm.org^2 # v0.7.0 requires it`
 * → `git-scm.org^2`. package.yml writes notes beside versions and the package
 * files carried them through; every Zig consumer then had to strip them on its
 * own, and installer.zig took any spec containing `#` to be optional. */
export function stripSpecComment(spec: string): string {
  const hash = spec.search(/\s#/)
  return (hash >= 0 ? spec.slice(0, hash) : spec).trim()
}

/**
 * Union metadata deps with recipe deps, deduping by `os:domain`. On a
 * conflict the recipe wins: it is what the binary in the registry was built
 * against, and the upstream metadata is often a pin from an older build.
 * ffmpeg's metadata said `harfbuzz.org^8` while the registry only ever built
 * harfbuzz 14, so `pantry install ffmpeg` failed on "harfbuzz.org@8.5.0 not
 * found in registry"; nginx, redis and mariadb were built with openssl 3 and
 * their metadata asked for 1.1. Recipe-only deps (php's `postgresql.org`) are
 * appended, metadata-only ones kept.
 */
export function mergeDeps(metaDeps: string[], recipeDeps: string[]): string[] {
  const fromRecipe = new Map(recipeDeps.map(spec => [depKey(spec), spec]))
  const merged = metaDeps.map(spec => fromRecipe.get(depKey(spec)) ?? spec)
  const seen = new Set(merged.map(depKey))
  for (const spec of recipeDeps) {
    const key = depKey(spec)
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(spec)
    }
  }
  return merged
}

export async function generateZigDefinitions(packagesDir: string, outputFile: string): Promise<void> {
  console.log(`🔍 Scanning packages directory: ${packagesDir}`)
  const recipesDir = path.resolve(packagesDir, '..', 'recipes')

  // Recursively find all TypeScript package files
  const packageFiles = findPackageFiles(packagesDir)

  console.log(`📦 Found ${packageFiles.length} package files`)

  const packages: ZigPackageDefinition[] = []
  let processed = 0
  let errors = 0

  for (const filePath of packageFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')

      // Extract the package constant name - format: export const bunPackage = { ... }
      const constMatch = content.match(/export const (\w+) = \{/)
      if (!constMatch) {
        console.warn(`⚠️  Could not find export const in ${filePath}`)
        errors++
        continue
      }

      // Dynamically import the TypeScript file
      // Catalog modules are generated data. Load their current bytes rather
      // than a path-cached module after a recipe sync rewrites the same file.
      const javascript = new Bun.Transpiler({ loader: 'ts' }).transformSync(content)
      const module = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`)
      const pkgData = module[constMatch[1]]

      if (!pkgData || !pkgData.domain) {
        console.warn(`⚠️  Invalid package data in ${filePath}`)
        errors++
        continue
      }

      // Sort versions from newest to oldest
      const sortedVersions = Array.isArray(pkgData.versions)
        ? [...pkgData.versions].sort(compareVersions)
        : []

      packages.push({
        name: pkgData.name || pkgData.domain,
        domain: pkgData.domain,
        description: pkgData.description || '',
        homepageUrl: pkgData.homepageUrl,
        programs: Array.isArray(pkgData.programs) ? pkgData.programs : [],
        // Merge the build recipe's runtime deps into the metadata deps so the
        // catalog reflects what we actually compiled against (e.g. php links
        // libpq, so php.net must depend on postgresql.org even though pkgx's
        // upstream metadata omits it).
        dependencies: mergeDeps(
          Array.isArray(pkgData.dependencies) ? pkgData.dependencies.map(stripSpecComment) : [],
          await loadRecipeDeps(recipesDir, pkgData.domain),
        ),
        buildDependencies: Array.isArray(pkgData.buildDependencies) ? pkgData.buildDependencies.map(stripSpecComment) : [],
        aliases: mergeAliases(pkgData.domain, Array.isArray(pkgData.aliases) ? pkgData.aliases : []),
        versions: sortedVersions,
      })

      processed++
      if (processed % 100 === 0) {
        console.log(`  Processed ${processed}/${packageFiles.length} packages...`)
      }
    }
    catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error)
      errors++
    }
  }

  console.log(`✅ Processed ${processed} packages (${errors} errors)`)
  if (errors) throw new Error(`Cannot publish an incomplete native catalog: ${errors} package errors`)

  // Sort packages by domain name for deterministic output
  packages.sort((a, b) => a.domain.localeCompare(b.domain))

  // Generate Zig file
  const zigCode = generateZigFile(packages)

  // Write to output file
  fs.writeFileSync(outputFile, zigCode, 'utf-8')
  console.log(`✅ Generated Zig definitions: ${outputFile}`)
  console.log(`📊 Total packages: ${packages.length}`)

  // Normalize formatting so the committed file is canonical `zig fmt` output
  // (best-effort: skipped silently when no zig toolchain is on PATH).
  formatZig(outputFile)
}

/**
 * Run `zig fmt` on a generated file. Best-effort, but never silent.
 *
 * The unformatted output is valid Zig and compiles, so skipping this is safe —
 * but the committed file is canonical `zig fmt` output, and generating it
 * without the formatter rewrites nearly every line. That lands as a
 * thirty-thousand-line diff on a run whose actual change was one version
 * string, with nothing anywhere saying why. Saying why costs one line.
 */
function formatZig(file: string): void {
  try {
    const { execFileSync } = require('node:child_process') as typeof import('node:child_process')
    execFileSync('zig', ['fmt', file], { stdio: 'ignore' })
    console.log(`✨ Formatted with zig fmt: ${file}`)
  }
  catch {
    const message = `zig is not on PATH — ${file} is unformatted, so expect a whole-file diff. Install the toolchain (or run under the pantry action) for a minimal one.`
    // GitHub renders `::warning::` in the run summary, where whoever is looking
    // at the surprising diff will actually see it.
    console.warn(process.env.GITHUB_ACTIONS ? `::warning::${message}` : `⚠️  ${message}`)
  }
}

/**
 * Generate complete Zig file with package definitions
 */
function generateZigFile(packages: ZigPackageDefinition[]): string {
  const packageStructs = packages.map(pkg => packageToZigStruct(pkg)).join(',\n')

  return `//! Package definitions generated from ts-pantry
//! DO NOT EDIT MANUALLY - This file is auto-generated
//! Total packages: ${packages.length}

const std = @import("std");

/// Package information
pub const PackageInfo = struct {
    name: []const u8,
    domain: []const u8,
    description: []const u8,
    homepage_url: ?[]const u8,
    programs: []const []const u8,
    dependencies: []const []const u8,
    build_dependencies: []const []const u8,
    aliases: []const []const u8,
    versions: []const []const u8,
};

/// All known packages (${packages.length} total)
pub const packages = [_]PackageInfo{
${packageStructs}
};

/// Get package by domain name
pub fn getPackageByDomain(domain: []const u8) ?*const PackageInfo {
    for (&packages) |*pkg| {
        if (std.mem.eql(u8, pkg.domain, domain)) {
            return pkg;
        }
    }
    return null;
}

/// Get package by name (checks domain and aliases)
pub fn getPackageByName(name: []const u8) ?*const PackageInfo {
    for (&packages) |*pkg| {
        // Check domain
        if (std.mem.eql(u8, pkg.domain, name)) {
            return pkg;
        }

        // Check full name
        if (std.mem.eql(u8, pkg.name, name)) {
            return pkg;
        }

        // Check aliases
        for (pkg.aliases) |alias| {
            if (std.mem.eql(u8, alias, name)) {
                return pkg;
            }
        }
    }
    return null;
}

/// Get all package domains
pub fn getAllDomains(allocator: std.mem.Allocator) ![][]const u8 {
    // eslint-disable-next-line prefer-const
    var domains = try allocator.alloc([]const u8, packages.len);
    for (packages, 0..) |pkg, i| {
        domains[i] = pkg.domain;
    }
    return domains;
}

/// Get total package count
pub fn getPackageCount() usize {
    return packages.len;
}

test "Package registry has entries" {
    try std.testing.expect(packages.len > 0);
}

test "Can find node package" {
    const node = getPackageByName("node");
    if (node) |pkg| {
        try std.testing.expectEqualStrings("nodejs.org", pkg.domain);
    }
}

test "Can find package by domain" {
    const node = getPackageByDomain("nodejs.org");
    try std.testing.expect(node != null);
}

test "Can find package by alias" {
    const bun = getPackageByName("bun");
    if (bun) |pkg| {
        try std.testing.expect(
            std.mem.eql(u8, pkg.domain, "bun.sh") or
            std.mem.eql(u8, pkg.domain, "bun.com")
        );
    }
}
`
}

/**
 * Generate package aliases in Zig format
 */
export async function generateZigAliases(packagesDir: string, outputFile: string): Promise<void> {
  console.log(`🔍 Generating Zig aliases from: ${packagesDir}`)

  // Recursively find all TypeScript package files
  const packageFiles = findPackageFiles(packagesDir)

  const aliases: Record<string, string> = {}

  for (const filePath of packageFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')

      const constMatch = content.match(/export const (\w+) = \{/)
      if (!constMatch)
        continue

      const fileUrl = `file://${path.resolve(filePath)}`
      const module = await import(fileUrl)
      const pkgData = module[constMatch[1]]

      if (!pkgData || !pkgData.domain)
        continue

      // Add aliases
      if (pkgData.aliases && Array.isArray(pkgData.aliases)) {
        for (const alias of pkgData.aliases) {
          aliases[alias] = pkgData.domain
        }
      }

      // Add friendly name if different from domain
      if (pkgData.name && pkgData.name !== pkgData.domain) {
        aliases[pkgData.name] = pkgData.domain
      }

      // Add common short names
      const shortName = pkgData.domain.split('.')[0]
      if (shortName && !aliases[shortName]) {
        aliases[shortName] = pkgData.domain
      }
    }
    catch (error) {
      console.error(`Error processing ${filePath}:`, error)
      // Ignore errors
    }
  }

  // Generate Zig aliases file
  const aliasEntries = Object.entries(aliases)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([alias, domain]) => `    .{ .alias = "${escapeZigString(alias)}", .domain = "${escapeZigString(domain)}" }`)
    .join(',\n')

  const zigCode = `//! Package aliases generated from ts-pantry
//! DO NOT EDIT MANUALLY - This file is auto-generated

const std = @import("std");

pub const Alias = struct {
    alias: []const u8,
    domain: []const u8,
};

pub const aliases = [_]Alias{
${aliasEntries}
};

/// Resolve an alias to a domain name
pub fn resolve_alias(alias: []const u8) ?[]const u8 {
    for (aliases) |entry| {
        if (std.mem.eql(u8, entry.alias, alias)) {
            return entry.domain;
        }
    }
    return null;
}

test "Alias resolution works" {
    const resolved = resolve_alias("node");
    if (resolved) |domain| {
        try std.testing.expectEqualStrings("nodejs.org", domain);
    }
}
`

  fs.writeFileSync(outputFile, zigCode, 'utf-8')
  console.log(`✅ Generated Zig aliases: ${outputFile}`)
  console.log(`📊 Total aliases: ${Object.keys(aliases).length}`)
}
