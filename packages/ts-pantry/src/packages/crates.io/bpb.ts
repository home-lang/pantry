/**
 * **bpb** - boats's personal barricade
 *
 * @domain `crates.io/bpb`
 * @programs `bpb`
 * @version `1.1.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/bpb`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiobpb
 * console.log(pkg.name)        // "bpb"
 * console.log(pkg.description) // "boats's personal barricade"
 * console.log(pkg.programs)    // ["bpb"]
 * console.log(pkg.versions[0]) // "1.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/bpb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiobpbPackage = {
  /**
   * The display name of this package.
   */
  name: 'bpb' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/bpb' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'boats\'s personal barricade' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/bpb/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/withoutboats/bpb' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/bpb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/bpb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/bpb' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bpb',
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
  ] as const,
  aliases: [] as const,
}

export type CratesiobpbPackage = typeof cratesiobpbPackage
