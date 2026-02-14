/**
 * **tcl** - pkgx package
 *
 * @domain `tcl.tk/tcl`
 * @programs `sqlite3_analyzer`, `tclsh{{version.major}}.{{version.minor}}`, `tclsh`
 * @version `9.0.3` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tcl.tk/tcl`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tcltktcl
 * console.log(pkg.name)        // "tcl"
 * console.log(pkg.programs)    // ["sqlite3_analyzer", "tclsh{{version.major}}.{{version.minor}}", ...]
 * console.log(pkg.versions[0]) // "9.0.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tcl-tk/tcl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tcltktclPackage = {
  /**
  * The display name of this package.
  */
  name: 'tcl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'tcl.tk/tcl' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tcl.tk/tcl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install tcl.tk/tcl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tcl.tk/tcl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tcl.tk/tcl' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sqlite3_analyzer',
    'tclsh{{version.major}}.{{version.minor}}',
    'tclsh',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '9.0.3',
    '9.0.2',
    '9.0.1',
    '8.6.17',
    '8.6.16',
    '8.6.14',
    '8.6.13',
  ] as const,
  aliases: [] as const,
}

export type TcltktclPackage = typeof tcltktclPackage
