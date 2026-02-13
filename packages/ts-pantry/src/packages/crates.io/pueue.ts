/**
 * **pueue** - Command-line tool for managing long-running shell commands
 *
 * @domain `crates.io/pueue`
 * @programs `pueue`, `pueued`
 * @version `4.0.2` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/pueue`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiopueue
 * console.log(pkg.name)        // "pueue"
 * console.log(pkg.description) // "Command-line tool for managing long-running she..."
 * console.log(pkg.programs)    // ["pueue", "pueued"]
 * console.log(pkg.versions[0]) // "4.0.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/pueue.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiopueuePackage = {
  /**
   * The display name of this package.
   */
  name: 'pueue' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/pueue' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command-line tool for managing long-running shell commands' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pueue/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Nukesor/pueue' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/pueue' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/pueue -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/pueue' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pueue',
    'pueued',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.4.1',
    '3.4.0',
    '3.3.3',
    '3.3.2',
  ] as const,
  aliases: [] as const,
}

export type CratesiopueuePackage = typeof cratesiopueuePackage
