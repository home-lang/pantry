/**
 * **bash** - Bourne-Again SHell, a UNIX command interpreter
 *
 * @domain `gnu.org/bash`
 * @programs `bash`, `bashbug`
 * @version `5.3.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/bash`
 * @homepage https://www.gnu.org/software/bash/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgbash
 * console.log(pkg.name)        // "bash"
 * console.log(pkg.description) // "Bourne-Again SHell, a UNIX command interpreter"
 * console.log(pkg.programs)    // ["bash", "bashbug"]
 * console.log(pkg.versions[0]) // "5.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/bash.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgbashPackage = {
  /**
   * The display name of this package.
   */
  name: 'bash' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/bash' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Bourne-Again SHell, a UNIX command interpreter' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/bash/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/bash/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/bash' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/bash -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/bash' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bash',
    'bashbug',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.3.0',
    '5.2.37',
    '5.2.32',
    '5.2.21',
    '5.2.15',
    '5.1.16',
  ] as const,
  aliases: [] as const,
}

export type GnuorgbashPackage = typeof gnuorgbashPackage
