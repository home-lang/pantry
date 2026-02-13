/**
 * **bartib** - A simple timetracker for the command line. It saves a log of all tracked activities as a plaintext file and allows you to create flexible reports.
 *
 * @domain `crates.io/bartib`
 * @programs `bartib`
 * @version `1.1.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/bartib`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiobartib
 * console.log(pkg.name)        // "bartib"
 * console.log(pkg.description) // "A simple timetracker for the command line. It s..."
 * console.log(pkg.programs)    // ["bartib"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/bartib.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiobartibPackage = {
  /**
   * The display name of this package.
   */
  name: 'bartib' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/bartib' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A simple timetracker for the command line. It saves a log of all tracked activities as a plaintext file and allows you to create flexible reports.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/bartib/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/nikolassv/bartib' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/bartib' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/bartib -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/bartib' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bartib',
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
  ] as const,
  aliases: [] as const,
}

export type CratesiobartibPackage = typeof cratesiobartibPackage
