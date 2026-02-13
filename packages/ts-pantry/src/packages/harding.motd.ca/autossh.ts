/**
 * **autossh** - Automatically restart SSH sessions and tunnels
 *
 * @domain `harding.motd.ca/autossh`
 * @programs `autossh`
 * @version `1.4f` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install harding.motd.ca/autossh`
 * @homepage https://www.harding.motd.ca/autossh/
 * @dependencies `openssh.com`
 * @buildDependencies `gnu.org/make`, `gnu.org/gcc` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hardingmotdcaautossh
 * console.log(pkg.name)        // "autossh"
 * console.log(pkg.description) // "Automatically restart SSH sessions and tunnels"
 * console.log(pkg.programs)    // ["autossh"]
 * console.log(pkg.versions[0]) // "1.4f" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/harding-motd-ca/autossh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hardingmotdcaautosshPackage = {
  /**
   * The display name of this package.
   */
  name: 'autossh' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'harding.motd.ca/autossh' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Automatically restart SSH sessions and tunnels' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/harding.motd.ca/autossh/package.yml' as const,
  homepageUrl: 'https://www.harding.motd.ca/autossh/' as const,
  githubUrl: 'https://github.com/Autossh/autossh' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install harding.motd.ca/autossh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +harding.motd.ca/autossh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install harding.motd.ca/autossh' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'autossh',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssh.com',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
    'gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4f',
  ] as const,
  aliases: [] as const,
}

export type HardingmotdcaautosshPackage = typeof hardingmotdcaautosshPackage
