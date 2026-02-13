/**
 * **v** - Simple, fast, safe, compiled language for developing maintainable software. Compiles itself in <1s with zero library dependencies. Supports automatic C => V translation. https://vlang.io
 *
 * @domain `vlang.io`
 * @programs `v`
 * @version `0.5.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install vlang.io`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.vlangio
 * console.log(pkg.name)        // "v"
 * console.log(pkg.description) // "Simple, fast, safe, compiled language for devel..."
 * console.log(pkg.programs)    // ["v"]
 * console.log(pkg.versions[0]) // "0.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/vlang-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const vlangioPackage = {
  /**
   * The display name of this package.
   */
  name: 'v' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'vlang.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Simple, fast, safe, compiled language for developing maintainable software. Compiles itself in <1s with zero library dependencies. Supports automatic C => V translation. https://vlang.io' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/vlang.io/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/vlang/v' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install vlang.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +vlang.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install vlang.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'v',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.5.0',
    '0.4.12',
    '0.4.11',
    '0.4.10',
    '0.4.9',
    '0.4.8',
    '0.4.7',
    '0.4.6',
    '0.4.5',
    '0.4.4',
    '0.4.3',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.5',
    '0.3.4',
    '0.3.3',
  ] as const,
  aliases: [] as const,
}

export type VlangioPackage = typeof vlangioPackage
