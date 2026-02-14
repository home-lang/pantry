/**
 * **samply** - Command-line sampling profiler for macOS, Linux, and Windows
 *
 * @domain `crates.io/samply`
 * @programs `samply`
 * @version `0.13.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/samply`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiosamply
 * console.log(pkg.name)        // "samply"
 * console.log(pkg.description) // "Command-line sampling profiler for macOS, Linux..."
 * console.log(pkg.programs)    // ["samply"]
 * console.log(pkg.versions[0]) // "0.13.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/samply.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiosamplyPackage = {
  /**
  * The display name of this package.
  */
  name: 'samply' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/samply' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Command-line sampling profiler for macOS, Linux, and Windows' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/samply/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mstange/samply' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/samply' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/samply -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/samply' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'samply',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.13.1',
    '0.13.0',
    '0.12.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiosamplyPackage = typeof cratesiosamplyPackage
