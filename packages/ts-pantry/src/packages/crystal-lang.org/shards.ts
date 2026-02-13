/**
 * **shards** - Fast and statically typed, compiled language with Ruby-like syntax
 *
 * @domain `crystal-lang.org/shards`
 * @programs `shards`
 * @version `0.20.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crystal-lang.org/shards`
 * @homepage https://crystal-lang.org/
 * @dependencies `hboehm.info/gc^8`, `pyyaml.org/libyaml^0`, `crystal-lang.org`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.crystallangorgshards
 * console.log(pkg.name)        // "shards"
 * console.log(pkg.description) // "Fast and statically typed, compiled language wi..."
 * console.log(pkg.programs)    // ["shards"]
 * console.log(pkg.versions[0]) // "0.20.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crystal-lang-org/shards.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const crystallangorgshardsPackage = {
  /**
   * The display name of this package.
   */
  name: 'shards' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crystal-lang.org/shards' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fast and statically typed, compiled language with Ruby-like syntax' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crystal-lang.org/shards/package.yml' as const,
  homepageUrl: 'https://crystal-lang.org/' as const,
  githubUrl: 'https://github.com/crystal-lang/crystal' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crystal-lang.org/shards' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crystal-lang.org/shards -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crystal-lang.org/shards' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'shards',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'hboehm.info/gc^8',
    'pyyaml.org/libyaml^0',
    'crystal-lang.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.20.0',
    '0.19.1',
    '0.19.0',
    '0.18.0',
    '0.17.4',
    '0.17.3',
  ] as const,
  aliases: [] as const,
}

export type CrystallangorgshardsPackage = typeof crystallangorgshardsPackage
