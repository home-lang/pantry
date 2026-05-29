/**
 * Recipe Types — Native TypeScript package build definitions
 *
 * These types define how packages are built, replacing the pkgx YAML recipes
 * and package-overrides.ts. Each package has a single .ts file in src/recipes/
 * that fully describes how to download, build, and install it.
 */

// ── Version Discovery ─────────────────────────────────────────────────

/** GitHub releases version source */
export interface GitHubReleasesSource {
  type: 'github-releases'
  repo: string // e.g. 'oven-sh/bun'
  /** Regex to extract version from tag (e.g. /^v(.+)$/ strips 'v' prefix) */
  tagPattern?: RegExp
  /** Only include stable releases (skip pre-releases) */
  stable?: boolean
}

/** GitHub tags version source */
export interface GitHubTagsSource {
  type: 'github-tags'
  repo: string
  tagPattern?: RegExp
}

/** URL pattern version check (checks if URL returns 200) */
export interface URLPatternSource {
  type: 'url-pattern'
  /** URL template with {{version}} placeholder */
  url: string
  /** Known versions to check for updates */
  knownVersions: string[]
}

/** Custom version discovery function */
export interface CustomVersionSource {
  type: 'custom'
  /** Async function that returns available versions (newest first) */
  fetch: () => Promise<string[]>
}

export type VersionSource = GitHubReleasesSource | GitHubTagsSource | URLPatternSource | CustomVersionSource

// ── Build Context ─────────────────────────────────────────────────────

/** Context passed to build scripts for template interpolation */
export interface BuildContext {
  version: string
  prefix: string
  buildDir: string
  platform: string // 'darwin' | 'linux' | 'windows'
  arch: string // 'aarch64' | 'x86-64' | 'x64'
  /** Platform-specific suffix for download URLs */
  platformSuffix?: string
}

// ── Recipe Definition ─────────────────────────────────────────────────

/** Source distributable (tarball/archive to download) */
export interface RecipeDistributable {
  /** URL template with {{version}} etc. */
  url: string
  stripComponents?: number
  /** Git ref/tag to check out for `git+https://` source URLs (e.g. 'v{{version.raw}}').
   * Consumed by build-package.ts downloadSource (git clone --branch <ref>). */
  ref?: string
}

/** Full recipe definition — replaces YAML + overrides */
export interface Recipe {
  domain: string
  name: string
  description?: string
  homepage?: string
  github?: string

  /** Executable programs provided by this package */
  programs: string[]

  /**
   * Runtime dependencies (domain → version constraint). Values may also be a
   * nested platform map (`{ linux: { 'gnu.org/gcc': '14' } }`) — the dep
   * extractor resolves platform/arch-keyed groups, mirroring pkgx.
   */
  dependencies?: Record<string, string | Record<string, string>>

  /** Build-time only dependencies (same shape as {@link dependencies}). */
  buildDependencies?: Record<string, string | Record<string, string>>

  /** Supported platforms */
  platforms?: string[]

  /** How to discover new versions */
  versionSource?: VersionSource

  /** Source archive to download (null for pre-built binaries) */
  distributable?: RecipeDistributable | null

  /** Build configuration */
  build: {
    /**
     * Build script lines — supports {{version}}, {{prefix}}, {{hw.platform}} etc.
     * A step may be a plain command string, or an object to attach a conditional
     * (`if`, e.g. a version range `<3.4.0` or platform `darwin/aarch64`) or a
     * `working-directory`. These flow straight through to the buildkit engine,
     * which evaluates the condition and runs the step in the given directory.
     */
    script: Array<string | { run: string | string[], if?: string, 'working-directory'?: string, prop?: string | { content?: string | string[], contents?: string | string[], extname?: string } }>
    /**
     * Environment variables. Values may be nested objects keyed by platform
     * (`darwin`/`linux`) or platform/arch (`darwin/aarch64`, `linux/x86-64`),
     * mirroring pkgx — used for arch-specific values like a configure target.
     */
    env?: Record<string, string | string[] | Record<string, string | string[]>>
    /** Platform-specific env overrides */
    platformEnv?: Record<string, Record<string, string>>
    /** Working directory relative to build dir */
    workingDirectory?: string
    /** Steps to skip (e.g. 'fix-machos', 'fix-patchelf') */
    skip?: string[]
  }

  /** Test script to verify the build */
  test?: {
    script: string[]
    env?: Record<string, string>
  }

  /** Props directory path (patches, config files) relative to recipe */
  propsDir?: string
}

// ── Loader Interface ──────────────────────────────────────────────────

/** Result from loading a recipe — either native TS or converted from YAML */
export interface LoadedRecipe {
  /** The normalized recipe in buildkit-compatible format */
  recipe: {
    distributable?: { url: string, 'strip-components'?: number } | null
    dependencies?: Record<string, any>
    build?: {
      dependencies?: Record<string, any>
      script?: string | (string | { run: string, 'working-directory'?: string, if?: string })[]
      env?: Record<string, any>
      'working-directory'?: string
      skip?: string | string[]
    }
    platforms?: string[]
    test?: any
  }
  /** Where the recipe came from */
  source: 'recipe' | 'yaml' | 'yaml+override'
  /** Path to props directory (if any) */
  propsDir?: string
}

/** @deprecated Use Recipe instead */
export type RecipeDefinition = Recipe
