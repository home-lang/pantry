/**
 * **pastel** - A command-line tool to generate, analyze, convert and manipulate colors
 *
 * @domain `crates.io/pastel`
 * @programs `pastel`
 * @version `0.11.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/pastel`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiopastel
 * console.log(pkg.name)        // "pastel"
 * console.log(pkg.description) // "A command-line tool to generate, analyze, conve..."
 * console.log(pkg.programs)    // ["pastel"]
 * console.log(pkg.versions[0]) // "0.11.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/pastel.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiopastelPackage = {
  /**
   * The display name of this package.
   */
  name: 'pastel' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/pastel' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A command-line tool to generate, analyze, convert and manipulate colors' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pastel/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sharkdp/pastel' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/pastel' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/pastel -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/pastel' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pastel',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.11.0',
    '0.10.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiopastelPackage = typeof cratesiopastelPackage
