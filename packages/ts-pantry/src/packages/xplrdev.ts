/**
 * **xplr** - A hackable, minimal, fast TUI file explorer
 *
 * @domain `xplr.dev`
 * @programs `xplr`
 * @version `1.1.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install xplr.dev`
 * @homepage https://xplr.dev
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.xplrdev
 * console.log(pkg.name)        // "xplr"
 * console.log(pkg.description) // "A hackable, minimal, fast TUI file explorer"
 * console.log(pkg.programs)    // ["xplr"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/xplr-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const xplrdevPackage = {
  /**
   * The display name of this package.
   */
  name: 'xplr' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'xplr.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A hackable, minimal, fast TUI file explorer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/xplr.dev/package.yml' as const,
  homepageUrl: 'https://xplr.dev' as const,
  githubUrl: 'https://github.com/sayanarijit/xplr' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install xplr.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +xplr.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install xplr.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xplr',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '0.21.10',
    '0.21.9',
    '0.21.8',
  ] as const,
  aliases: [] as const,
}

export type XplrdevPackage = typeof xplrdevPackage
