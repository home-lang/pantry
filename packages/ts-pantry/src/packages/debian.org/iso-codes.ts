/**
 * **iso-codes** - pkgx package
 *
 * @domain `debian.org/iso-codes`
 * @version `4.20.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install debian.org/iso-codes`
 * @dependencies `gnu.org/gettext`
 * @buildDependencies `python.org@<3.12`, `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.debianorgisocodes
 * console.log(pkg.name)        // "iso-codes"
 * console.log(pkg.versions[0]) // "4.20.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/debian-org/iso-codes.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const debianorgisocodesPackage = {
  /**
   * The display name of this package.
   */
  name: 'iso-codes' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'debian.org/iso-codes' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/debian.org/iso-codes/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install debian.org/iso-codes' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +debian.org/iso-codes -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install debian.org/iso-codes' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/gettext',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@<3.12',
    'mesonbuild.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.20.1',
    '4.19.0',
    '4.18.0',
    '4.17.0',
    '4.16.0',
    '4.15.0',
  ] as const,
  aliases: [] as const,
}

export type DebianorgisocodesPackage = typeof debianorgisocodesPackage
