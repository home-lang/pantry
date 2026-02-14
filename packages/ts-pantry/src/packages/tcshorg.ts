/**
 * **tcsh** - Enhanced, fully compatible version of the Berkeley C shell
 *
 * @domain `tcsh.org`
 * @programs `csh`, `tcsh`
 * @version `6.24.16` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tcsh.org`
 * @homepage https://www.tcsh.org/
 * @dependencies `github.com/besser82/libxcrypt@4`, `invisible-island.net/ncurses@6`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tcshorg
 * console.log(pkg.name)        // "tcsh"
 * console.log(pkg.description) // "Enhanced, fully compatible version of the Berke..."
 * console.log(pkg.programs)    // ["csh", "tcsh"]
 * console.log(pkg.versions[0]) // "6.24.16" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tcsh-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tcshorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'tcsh' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'tcsh.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Enhanced, fully compatible version of the Berkeley C shell' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tcsh.org/package.yml' as const,
  homepageUrl: 'https://www.tcsh.org/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install tcsh.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tcsh.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tcsh.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'csh',
    'tcsh',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'github.com/besser82/libxcrypt@4',
    'invisible-island.net/ncurses@6',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '6.24.16',
    '6.24.15',
  ] as const,
  aliases: [] as const,
}

export type TcshorgPackage = typeof tcshorgPackage
