/**
 * **help2man** - Automatically generate simple man pages
 *
 * @domain `gnu.org/help2man`
 * @programs `help2man`
 * @version `1.49.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/help2man`
 * @homepage https://www.gnu.org/software/help2man/
 * @dependencies `gnu.org/gettext^0`, `perl.org~5.42 # perl modules require matching minors; must match gettext`
 * @buildDependencies `cpanmin.us` - required only when building from source
 * @companions `PERL5LIB^{{prefix}}/lib/perl5:{{prefix}}/libexec/lib/perl5:$PERL5LIB`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorghelp2man
 * console.log(pkg.name)        // "help2man"
 * console.log(pkg.description) // "Automatically generate simple man pages"
 * console.log(pkg.programs)    // ["help2man"]
 * console.log(pkg.versions[0]) // "1.49.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/help2man.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorghelp2manPackage = {
  /**
  * The display name of this package.
  */
  name: 'help2man' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/help2man' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Automatically generate simple man pages' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/help2man/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/help2man/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/help2man' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/help2man -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/help2man' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'help2man',
  ] as const,
  /**
  * Related packages that work well with this package.
  * Consider installing these for enhanced functionality.
  */
  companions: [
    'PERL5LIB^{{prefix}}/lib/perl5:{{prefix}}/libexec/lib/perl5:$PERL5LIB',
  ] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/gettext^0',
    'perl.org~5.42 # perl modules require matching minors; must match gettext',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cpanmin.us',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.49.3',
  ] as const,
  aliases: [] as const,
}

export type Gnuorghelp2manPackage = typeof gnuorghelp2manPackage
