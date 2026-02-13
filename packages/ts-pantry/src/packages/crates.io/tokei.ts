/**
 * **tokei** - Program that allows you to count code, quickly
 *
 * @domain `crates.io/tokei`
 * @programs `tokei`
 * @version `14.0.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/tokei`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiotokei
 * console.log(pkg.name)        // "tokei"
 * console.log(pkg.description) // "Program that allows you to count code, quickly"
 * console.log(pkg.programs)    // ["tokei"]
 * console.log(pkg.versions[0]) // "14.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/tokei.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiotokeiPackage = {
  /**
   * The display name of this package.
   */
  name: 'tokei' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/tokei' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Program that allows you to count code, quickly' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/tokei/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/XAMPPRocky/tokei' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/tokei' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/tokei -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/tokei' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tokei',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '14.0.0',
    '13.0.0',
    '12.1.2',
  ] as const,
  aliases: [] as const,
}

export type CratesiotokeiPackage = typeof cratesiotokeiPackage
