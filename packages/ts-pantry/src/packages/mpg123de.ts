/**
 * **mpg123** - MP3 player for Linux and UNIX
 *
 * @domain `mpg123.de`
 * @programs `mpg123`
 * @version `1.33.4` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mpg123.de`
 * @homepage https://www.mpg123.de/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mpg123de
 * console.log(pkg.name)        // "mpg123"
 * console.log(pkg.description) // "MP3 player for Linux and UNIX"
 * console.log(pkg.programs)    // ["mpg123"]
 * console.log(pkg.versions[0]) // "1.33.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mpg123-de.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mpg123dePackage = {
  /**
   * The display name of this package.
   */
  name: 'mpg123' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mpg123.de' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'MP3 player for Linux and UNIX' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mpg123.de/package.yml' as const,
  homepageUrl: 'https://www.mpg123.de/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mpg123.de' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mpg123.de -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mpg123.de' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mpg123',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.33.4',
    '1.33.3',
    '1.33.2',
    '1.33.1',
    '1.33.0',
    '1.32.11',
    '1.32.10',
    '1.32.9',
    '1.32.8',
    '1.32.7',
    '1.32.6',
    '1.32.5',
    '1.32.4',
    '1.32.3',
    '1.32.2',
    '1.32.1',
    '1.32.0',
    '1.31.4',
    '1.31.2',
  ] as const,
  aliases: [] as const,
}

export type Mpg123dePackage = typeof mpg123dePackage
