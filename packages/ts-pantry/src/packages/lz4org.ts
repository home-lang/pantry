/**
 * **lz4** - Extremely Fast Compression algorithm
 *
 * @domain `lz4.org`
 * @programs `lz4`
 * @version `1.10.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install lz4.org`
 * @homepage https://lz4.github.io/lz4/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.lz4org
 * console.log(pkg.name)        // "lz4"
 * console.log(pkg.description) // "Extremely Fast Compression algorithm"
 * console.log(pkg.programs)    // ["lz4"]
 * console.log(pkg.versions[0]) // "1.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/lz4-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const lz4orgPackage = {
  /**
   * The display name of this package.
   */
  name: 'lz4' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'lz4.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Extremely Fast Compression algorithm' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/lz4.org/package.yml' as const,
  homepageUrl: 'https://lz4.github.io/lz4/' as const,
  githubUrl: 'https://github.com/lz4/lz4' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install lz4.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +lz4.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install lz4.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lz4',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.10.0',
    '1.9.4',
  ] as const,
  aliases: [] as const,
}

export type Lz4orgPackage = typeof lz4orgPackage
