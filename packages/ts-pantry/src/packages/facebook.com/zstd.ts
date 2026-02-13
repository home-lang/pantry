/**
 * **zstd** - Zstandard - Fast real-time compression algorithm
 *
 * @domain `facebook.com/zstd`
 * @programs `pzstd`, `unzstd`, `zstd`, `zstdcat`, `zstdgrep`, ... (+2 more)
 * @version `1.5.7` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install facebook.com/zstd`
 * @homepage https://facebook.github.io/zstd/
 * @dependencies `lz4.org^1`, `tukaani.org/xz^5`, `zlib.net^1`
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.facebookcomzstd
 * console.log(pkg.name)        // "zstd"
 * console.log(pkg.description) // "Zstandard - Fast real-time compression algorithm"
 * console.log(pkg.programs)    // ["pzstd", "unzstd", ...]
 * console.log(pkg.versions[0]) // "1.5.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/facebook-com/zstd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const facebookcomzstdPackage = {
  /**
   * The display name of this package.
   */
  name: 'zstd' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'facebook.com/zstd' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Zstandard - Fast real-time compression algorithm' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/zstd/package.yml' as const,
  homepageUrl: 'https://facebook.github.io/zstd/' as const,
  githubUrl: 'https://github.com/facebook/zstd' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install facebook.com/zstd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +facebook.com/zstd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install facebook.com/zstd' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pzstd',
    'unzstd',
    'zstd',
    'zstdcat',
    'zstdgrep',
    'zstdless',
    'zstdmt',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'lz4.org^1',
    'tukaani.org/xz^5',
    'zlib.net^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.5.7',
    '1.5.6',
    '1.5.5',
    '1.5.4',
    '1.5.2',
  ] as const,
  aliases: [] as const,
}

export type FacebookcomzstdPackage = typeof facebookcomzstdPackage
