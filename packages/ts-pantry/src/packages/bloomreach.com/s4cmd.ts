/**
 * **s4cmd** - Super S3 command line tool
 *
 * @domain `bloomreach.com/s4cmd`
 * @programs `s4cmd`
 * @version `2.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install bloomreach.com/s4cmd`
 * @dependencies `python.org>=3<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.bloomreachcoms4cmd
 * console.log(pkg.name)        // "s4cmd"
 * console.log(pkg.description) // "Super S3 command line tool"
 * console.log(pkg.programs)    // ["s4cmd"]
 * console.log(pkg.versions[0]) // "2.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/bloomreach-com/s4cmd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const bloomreachcoms4cmdPackage = {
  /**
   * The display name of this package.
   */
  name: 's4cmd' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'bloomreach.com/s4cmd' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Super S3 command line tool' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/bloomreach.com/s4cmd/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/bloomreach/s4cmd' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install bloomreach.com/s4cmd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +bloomreach.com/s4cmd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install bloomreach.com/s4cmd' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    's4cmd',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.1.0',
  ] as const,
  aliases: [] as const,
}

export type Bloomreachcoms4cmdPackage = typeof bloomreachcoms4cmdPackage
