/**
 * **hexedit** - View and edit files in hexadecimal or in ASCII
 *
 * @domain `rigaux.org/hexedit`
 * @programs `hexedit`
 * @version `1.6.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rigaux.org/hexedit`
 * @homepage https://rigaux.org/hexedit.html
 * @dependencies `invisible-island.net/ncurses@6`
 * @buildDependencies `gnu.org/autoconf` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rigauxorghexedit
 * console.log(pkg.name)        // "hexedit"
 * console.log(pkg.description) // "View and edit files in hexadecimal or in ASCII"
 * console.log(pkg.programs)    // ["hexedit"]
 * console.log(pkg.versions[0]) // "1.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rigaux-org/hexedit.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rigauxorghexeditPackage = {
  /**
  * The display name of this package.
  */
  name: 'hexedit' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rigaux.org/hexedit' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'View and edit files in hexadecimal or in ASCII' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rigaux.org/hexedit/package.yml' as const,
  homepageUrl: 'https://rigaux.org/hexedit.html' as const,
  githubUrl: 'https://github.com/pixel/hexedit' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rigaux.org/hexedit' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rigaux.org/hexedit -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rigaux.org/hexedit' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'hexedit',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'invisible-island.net/ncurses@6',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.6.0',
  ] as const,
  aliases: [] as const,
}

export type RigauxorghexeditPackage = typeof rigauxorghexeditPackage
