/**
 * **eigen.tuxfamily** - pkgx package
 *
 * @domain `eigen.tuxfamily.org`
 * @version `5.0.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install eigen.tuxfamily.org`
 * @dependencies `linux:gnu.org/gcc/libstdcxx@14` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.eigentuxfamilyorg
 * console.log(pkg.name)        // "eigen.tuxfamily"
 * console.log(pkg.versions[0]) // "5.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/eigen-tuxfamily-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const eigentuxfamilyorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'eigen.tuxfamily' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'eigen.tuxfamily.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/eigen.tuxfamily.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install eigen.tuxfamily.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +eigen.tuxfamily.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install eigen.tuxfamily.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:gnu.org/gcc/libstdcxx@14',
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
    '5.0.1',
    '5.0.0',
    '3.4.1',
    '3.4.0',
  ] as const,
  aliases: [] as const,
}

export type EigentuxfamilyorgPackage = typeof eigentuxfamilyorgPackage
