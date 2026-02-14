/**
 * **stow** - Organize software neatly under a single directory tree (e.g. /usr/local)
 *
 * @domain `gnu.org/stow`
 * @programs `stow`
 * @version `2.4.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/stow`
 * @homepage https://www.gnu.org/software/stow/
 * @dependencies `perl.org^5.6.1`
 * @buildDependencies `cpanmin.us@^1` - required only when building from source
 * @companions `PERL5LIB^${{prefix}}/lib/perl5`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgstow
 * console.log(pkg.name)        // "stow"
 * console.log(pkg.description) // "Organize software neatly under a single directo..."
 * console.log(pkg.programs)    // ["stow"]
 * console.log(pkg.versions[0]) // "2.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/stow.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgstowPackage = {
  /**
  * The display name of this package.
  */
  name: 'stow' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/stow' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Organize software neatly under a single directory tree (e.g. /usr/local)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/stow/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/stow/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/stow' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/stow -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/stow' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'stow',
  ] as const,
  /**
  * Related packages that work well with this package.
  * Consider installing these for enhanced functionality.
  */
  companions: [
    'PERL5LIB^${{prefix}}/lib/perl5',
  ] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'perl.org^5.6.1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cpanmin.us@^1',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.4.1',
    '2.4.0',
    '2.3.1',
  ] as const,
  aliases: [] as const,
}

export type GnuorgstowPackage = typeof gnuorgstowPackage
