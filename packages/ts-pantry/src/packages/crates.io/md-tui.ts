/**
 * **md-tui** - Markdown renderer in the terminal
 *
 * @domain `crates.io/md-tui`
 * @programs `mdt`, `md-tui`
 * @version `0.9.3` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/md-tui`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiomdtui
 * console.log(pkg.name)        // "md-tui"
 * console.log(pkg.description) // "Markdown renderer in the terminal"
 * console.log(pkg.programs)    // ["mdt", "md-tui"]
 * console.log(pkg.versions[0]) // "0.9.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/md-tui.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiomdtuiPackage = {
  /**
   * The display name of this package.
   */
  name: 'md-tui' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/md-tui' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Markdown renderer in the terminal' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/md-tui/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/henriklovhaug/md-tui' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/md-tui' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/md-tui -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/md-tui' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mdt',
    'md-tui',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.7',
    '0.8.6',
    '0.8.5',
    '0.8.4',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.4',
    '0.7.3',
  ] as const,
  aliases: [] as const,
}

export type CratesiomdtuiPackage = typeof cratesiomdtuiPackage
