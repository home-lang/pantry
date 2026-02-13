/**
 * **texinfo** - Official documentation format of the GNU project
 *
 * @domain `gnu.org/texinfo`
 * @programs `info`, `install-info`, `makeinfo`, `pdftexi2dvi`, `pod2texi`, ... (+4 more)
 * @version `7.2.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/texinfo`
 * @homepage https://www.gnu.org/software/texinfo/
 * @dependencies `perl.org`
 * @buildDependencies `gnu.org/gettext` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgtexinfo
 * console.log(pkg.name)        // "texinfo"
 * console.log(pkg.description) // "Official documentation format of the GNU project"
 * console.log(pkg.programs)    // ["info", "install-info", ...]
 * console.log(pkg.versions[0]) // "7.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/texinfo.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgtexinfoPackage = {
  /**
   * The display name of this package.
   */
  name: 'texinfo' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/texinfo' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Official documentation format of the GNU project' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/texinfo/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/texinfo/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/texinfo' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/texinfo -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/texinfo' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'info',
    'install-info',
    'makeinfo',
    'pdftexi2dvi',
    'pod2texi',
    'texi2any',
    'texi2dvi',
    'texi2pdf',
    'texindex',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'perl.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/gettext',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '7.2.0',
    '7.1.1',
    '7.1.0',
    '7.0.3',
    '7.0.1',
  ] as const,
  aliases: [] as const,
}

export type GnuorgtexinfoPackage = typeof gnuorgtexinfoPackage
