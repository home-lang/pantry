/**
 * **tar** - Multi-format archive and compression library
 *
 * @domain `gnu.org/tar`
 * @programs `tar`
 * @version `1.35.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/tar`
 * @homepage https://www.libarchive.org
 * @buildDependencies `gnu.org/patch`, `gnu.org/autoconf`, `gnu.org/automake` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgtar
 * console.log(pkg.name)        // "tar"
 * console.log(pkg.description) // "Multi-format archive and compression library"
 * console.log(pkg.programs)    // ["tar"]
 * console.log(pkg.versions[0]) // "1.35.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/tar.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgtarPackage = {
  /**
   * The display name of this package.
   */
  name: 'tar' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/tar' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Multi-format archive and compression library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/tar/package.yml' as const,
  homepageUrl: 'https://www.libarchive.org' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/tar' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/tar -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/tar' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tar',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/patch',
    'gnu.org/autoconf',
    'gnu.org/automake',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.35.0',
    '1.34.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgtarPackage = typeof gnuorgtarPackage
