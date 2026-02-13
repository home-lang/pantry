/**
 * **plocate.sesse** - pkgx package
 *
 * @domain `plocate.sesse.net`
 * @programs `plocate`, `plocate-build`, `updatedb`
 * @version `1.1.24` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install plocate.sesse.net`
 * @dependencies `facebook.com/zstd@1`, `gnu.org/gcc/libstdcxx@14`
 * @buildDependencies `mesonbuild.com@^1`, `cmake.org@^3`, `gnu.org/gcc` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.plocatesessenet
 * console.log(pkg.name)        // "plocate.sesse"
 * console.log(pkg.programs)    // ["plocate", "plocate-build", ...]
 * console.log(pkg.versions[0]) // "1.1.24" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/plocate-sesse-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const plocatesessenetPackage = {
  /**
   * The display name of this package.
   */
  name: 'plocate.sesse' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'plocate.sesse.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/plocate.sesse.net/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install plocate.sesse.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +plocate.sesse.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install plocate.sesse.net' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'plocate',
    'plocate-build',
    'updatedb',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'facebook.com/zstd@1',
    'gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com@^1',
    'cmake.org@^3',
    'gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1.24',
    '1.1.23',
    '1.1.22',
  ] as const,
  aliases: [] as const,
}

export type PlocatesessenetPackage = typeof plocatesessenetPackage
