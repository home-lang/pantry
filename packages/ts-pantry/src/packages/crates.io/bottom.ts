/**
 * **btm** - Yet another cross-platform graphical process/system monitor.
 *
 * @domain `crates.io/bottom`
 * @programs `btm`
 * @version `0.12.3` (21 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/bottom`
 * @homepage https://clementtsang.github.io/bottom/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiobottom
 * console.log(pkg.name)        // "btm"
 * console.log(pkg.description) // "Yet another cross-platform graphical process/sy..."
 * console.log(pkg.programs)    // ["btm"]
 * console.log(pkg.versions[0]) // "0.12.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/bottom.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiobottomPackage = {
  /**
   * The display name of this package.
   */
  name: 'btm' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/bottom' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Yet another cross-platform graphical process/system monitor.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/bottom/package.yml' as const,
  homepageUrl: 'https://clementtsang.github.io/bottom/' as const,
  githubUrl: 'https://github.com/ClementTsang/bottom' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/bottom' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/bottom -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/bottom' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'btm',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.12.3',
    '0.12.2',
    '0.12.1',
    '0.12.0',
    '0.11.4',
    '0.11.3',
    '0.11.2',
    '0.11.1',
    '0.11.0',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.7',
    '0.9.6',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
    '0.8.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiobottomPackage = typeof cratesiobottomPackage
