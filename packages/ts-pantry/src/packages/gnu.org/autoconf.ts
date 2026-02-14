/**
 * **autoconf** - Automatic configure script builder
 *
 * @domain `gnu.org/autoconf`
 * @programs `autoconf`, `autoheader`, `autom4te`, `autoreconf`, `autoscan`, ... (+2 more)
 * @version `2.72.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/autoconf`
 * @homepage https://www.gnu.org/software/autoconf/
 * @dependencies `gnu.org/m4@1`, `perl.org`
 * @buildDependencies `llvm.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgautoconf
 * console.log(pkg.name)        // "autoconf"
 * console.log(pkg.description) // "Automatic configure script builder"
 * console.log(pkg.programs)    // ["autoconf", "autoheader", ...]
 * console.log(pkg.versions[0]) // "2.72.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/autoconf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgautoconfPackage = {
  /**
  * The display name of this package.
  */
  name: 'autoconf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/autoconf' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Automatic configure script builder' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/autoconf/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/autoconf/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/autoconf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/autoconf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/autoconf' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'autoconf',
    'autoheader',
    'autom4te',
    'autoreconf',
    'autoscan',
    'autoupdate',
    'ifnames',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/m4@1',
    'perl.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'llvm.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.72.0',
    '2.71.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgautoconfPackage = typeof gnuorgautoconfPackage
