/**
 * **telnet** - pkgx package
 *
 * @domain `apple.com/remote_cmds`
 * @programs `telnet`
 * @version `306.0.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apple.com/remote_cmds`
 * @homepage https://opensource.apple.com/releases
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.applecomremote_cmds
 * console.log(pkg.name)        // "telnet"
 * console.log(pkg.programs)    // ["telnet"]
 * console.log(pkg.versions[0]) // "306.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apple-com/remote_cmds.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const applecomremote_cmdsPackage = {
  /**
   * The display name of this package.
   */
  name: 'telnet' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'apple.com/remote_cmds' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apple.com/remote_cmds/package.yml' as const,
  homepageUrl: 'https://opensource.apple.com/releases' as const,
  githubUrl: 'https://github.com/apple-oss-distributions/remote_cmds' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install apple.com/remote_cmds' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apple.com/remote_cmds -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apple.com/remote_cmds' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'telnet',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '306.0.0',
    '303.141.1',
    '303.0.2',
    '302.0.0',
    '294.0.0',
  ] as const,
  aliases: [] as const,
}

export type Applecomremote_cmdsPackage = typeof applecomremote_cmdsPackage
