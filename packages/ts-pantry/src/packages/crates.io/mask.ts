/**
 * **mask** - 🎭 A CLI task runner defined by a simple markdown file
 *
 * @domain `crates.io/mask`
 * @programs `mask`
 * @version `0.11.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/mask`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiomask
 * console.log(pkg.name)        // "mask"
 * console.log(pkg.description) // "🎭 A CLI task runner defined by a simple markdo..."
 * console.log(pkg.programs)    // ["mask"]
 * console.log(pkg.versions[0]) // "0.11.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/mask.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiomaskPackage = {
  /**
   * The display name of this package.
   */
  name: 'mask' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/mask' as const,
  /**
   * Brief description of what this package does.
   */
  description: '🎭 A CLI task runner defined by a simple markdown file' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/mask/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/jakedeichert/mask' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/mask' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/mask -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/mask' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mask',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.11.3',
  ] as const,
  aliases: [] as const,
}

export type CratesiomaskPackage = typeof cratesiomaskPackage
