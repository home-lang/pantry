/**
 * **bat** - Clone of cat(1) with syntax highlighting and Git integration
 *
 * @domain `crates.io/bat`
 * @programs `bat`
 * @version `0.26.1` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/bat`
 * @dependencies `zlib.net^1`, `libgit2.org~1.7 # links to libgit2.so.1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiobat
 * console.log(pkg.name)        // "bat"
 * console.log(pkg.description) // "Clone of cat(1) with syntax highlighting and Gi..."
 * console.log(pkg.programs)    // ["bat"]
 * console.log(pkg.versions[0]) // "0.26.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/bat.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiobatPackage = {
  /**
   * The display name of this package.
   */
  name: 'bat' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/bat' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Clone of cat(1) with syntax highlighting and Git integration' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/bat/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sharkdp/bat' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/bat' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/bat -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/bat' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bat',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1',
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.26.1',
    '0.26.0',
    '0.25.0',
    '0.24.0',
    '0.23.0',
    '0.22.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiobatPackage = typeof cratesiobatPackage
