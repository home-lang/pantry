/**
 * **acl** - pkgx package
 *
 * @domain `savannah.nongnu.org/acl`
 * @programs `chacl`, `getfacl`, `setfacl`
 * @version `2.3.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install savannah.nongnu.org/acl`
 * @buildDependencies `linux:gnu.org/gcc`, `gnu.org/libtool`, `savannah.nongnu.org/attr` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.savannahnongnuorgacl
 * console.log(pkg.name)        // "acl"
 * console.log(pkg.programs)    // ["chacl", "getfacl", ...]
 * console.log(pkg.versions[0]) // "2.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/savannah-nongnu-org/acl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const savannahnongnuorgaclPackage = {
  /**
   * The display name of this package.
   */
  name: 'acl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'savannah.nongnu.org/acl' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/savannah.nongnu.org/acl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install savannah.nongnu.org/acl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +savannah.nongnu.org/acl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install savannah.nongnu.org/acl' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'chacl',
    'getfacl',
    'setfacl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'linux:gnu.org/gcc',
    'gnu.org/libtool',
    'savannah.nongnu.org/attr',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.3.2',
  ] as const,
  aliases: [] as const,
}

export type SavannahnongnuorgaclPackage = typeof savannahnongnuorgaclPackage
