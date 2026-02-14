/**
 * **expect** - Program that can automate interactive applications
 *
 * @domain `tcl-lang.org/expect`
 * @programs `autoexpect`, `autopasswd`, `cryptdir`, `decryptdir`, `dislocate`, ... (+17 more)
 * @version `5.45.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tcl-lang.org/expect`
 * @homepage https://core.tcl-lang.org/expect/index
 * @dependencies `tcl.tk/tcl^8`
 * @buildDependencies `gnu.org/automake`, `gnu.org/autoconf`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tcllangorgexpect
 * console.log(pkg.name)        // "expect"
 * console.log(pkg.description) // "Program that can automate interactive applications"
 * console.log(pkg.programs)    // ["autoexpect", "autopasswd", ...]
 * console.log(pkg.versions[0]) // "5.45.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tcl-lang-org/expect.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tcllangorgexpectPackage = {
  /**
  * The display name of this package.
  */
  name: 'expect' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'tcl-lang.org/expect' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Program that can automate interactive applications' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tcl-lang.org/expect/package.yml' as const,
  homepageUrl: 'https://core.tcl-lang.org/expect/index' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install tcl-lang.org/expect' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tcl-lang.org/expect -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tcl-lang.org/expect' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'autoexpect',
    'autopasswd',
    'cryptdir',
    'decryptdir',
    'dislocate',
    'expect',
    'ftp-rfc',
    'kibitz',
    'lpunlock',
    'mkpasswd',
    'multixterm',
    'passmass',
    'rftp',
    'rlogin-cwd',
    'timed-read',
    'timed-run',
    'tknewsbiff',
    'tkpasswd',
    'unbuffer',
    'weather',
    'xkibitz',
    'xpstat',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'tcl.tk/tcl^8',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/automake',
    'gnu.org/autoconf',
    'gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.45.4',
    '5.45.3',
    '5.45.0',
  ] as const,
  aliases: [] as const,
}

export type TcllangorgexpectPackage = typeof tcllangorgexpectPackage
