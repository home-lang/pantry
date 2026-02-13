/**
 * **pier** - A Linux script management CLI written in Rust
 *
 * @domain `crates.io/pier`
 * @programs `pier`
 * @version `0.1.6` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/pier`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiopier
 * console.log(pkg.name)        // "pier"
 * console.log(pkg.description) // "A Linux script management CLI written in Rust"
 * console.log(pkg.programs)    // ["pier"]
 * console.log(pkg.versions[0]) // "0.1.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/pier.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiopierPackage = {
  /**
   * The display name of this package.
   */
  name: 'pier' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/pier' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A Linux script management CLI written in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pier/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/pier-cli/pier' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/pier' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/pier -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/pier' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pier',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.6',
    '0.1.5',
  ] as const,
  aliases: [] as const,
}

export type CratesiopierPackage = typeof cratesiopierPackage
