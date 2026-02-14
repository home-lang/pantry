/**
 * **libb2** - C library providing BLAKE2b, BLAKE2s, BLAKE2bp, BLAKE2sp
 *
 * @domain `blake2.net/libb2`
 * @version `0.98.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install blake2.net/libb2`
 * @buildDependencies `gnu.org/gcc` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.blake2netlibb2
 * console.log(pkg.name)        // "libb2"
 * console.log(pkg.description) // "C library providing BLAKE2b, BLAKE2s, BLAKE2bp,..."
 * console.log(pkg.versions[0]) // "0.98.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/blake2-net/libb2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const blake2netlibb2Package = {
  /**
  * The display name of this package.
  */
  name: 'libb2' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'blake2.net/libb2' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'C library providing BLAKE2b, BLAKE2s, BLAKE2bp, BLAKE2sp' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/blake2.net/libb2/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/BLAKE2/libb2' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install blake2.net/libb2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +blake2.net/libb2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install blake2.net/libb2' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/gcc',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.98.1',
  ] as const,
  aliases: [] as const,
}

export type Blake2netlibb2Package = typeof blake2netlibb2Package
