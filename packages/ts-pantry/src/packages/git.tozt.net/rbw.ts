/**
 * **rbw** - Unofficial Bitwarden CLI client
 *
 * @domain `git.tozt.net/rbw`
 * @programs `rbw`
 * @version `1.15.0` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install git.tozt.net/rbw`
 * @homepage https://git.tozt.net/rbw
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gittoztnetrbw
 * console.log(pkg.name)        // "rbw"
 * console.log(pkg.description) // "Unofficial Bitwarden CLI client"
 * console.log(pkg.programs)    // ["rbw"]
 * console.log(pkg.versions[0]) // "1.15.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/git-tozt-net/rbw.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gittoztnetrbwPackage = {
  /**
   * The display name of this package.
   */
  name: 'rbw' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'git.tozt.net/rbw' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Unofficial Bitwarden CLI client' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/git.tozt.net/rbw/package.yml' as const,
  homepageUrl: 'https://git.tozt.net/rbw' as const,
  githubUrl: 'https://github.com/doy/rbw' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install git.tozt.net/rbw' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +git.tozt.net/rbw -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install git.tozt.net/rbw' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rbw',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.15.0',
    '1.14.1',
    '1.14.0',
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.1',
    '1.12.0',
    '1.11.1',
    '1.11.0',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.0',
  ] as const,
  aliases: [] as const,
}

export type GittoztnetrbwPackage = typeof gittoztnetrbwPackage
