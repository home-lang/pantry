/**
 * **licensor** - write licenses to stdout
 *
 * @domain `crates.io/licensor`
 * @programs `licensor`
 * @version `2.1.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/licensor`
 * @dependencies `zlib.net^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiolicensor
 * console.log(pkg.name)        // "licensor"
 * console.log(pkg.description) // "write licenses to stdout"
 * console.log(pkg.programs)    // ["licensor"]
 * console.log(pkg.versions[0]) // "2.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/licensor.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiolicensorPackage = {
  /**
   * The display name of this package.
   */
  name: 'licensor' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/licensor' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'write licenses to stdout' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/licensor/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/raftario/licensor' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/licensor' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/licensor -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/licensor' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'licensor',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.1.0',
    '2.0.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiolicensorPackage = typeof cratesiolicensorPackage
