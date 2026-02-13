/**
 * **ord** - Index, block explorer, and command-line wallet
 *
 * @domain `ordinals.com`
 * @programs `ord`
 * @version `0.6.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ordinals.com`
 * @homepage https://ordinals.com/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ordinalscom
 * console.log(pkg.name)        // "ord"
 * console.log(pkg.description) // "Index, block explorer, and command-line wallet"
 * console.log(pkg.programs)    // ["ord"]
 * console.log(pkg.versions[0]) // "0.6.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ordinals-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ordinalscomPackage = {
  /**
   * The display name of this package.
   */
  name: 'ord' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'ordinals.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Index, block explorer, and command-line wallet' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ordinals.com/package.yml' as const,
  homepageUrl: 'https://ordinals.com/' as const,
  githubUrl: 'https://github.com/ordinals/ord' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install ordinals.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ordinals.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ordinals.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ord',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.6.1',
    '0.6.0',
    '0.5.1',
    '0.5.0',
  ] as const,
  aliases: [] as const,
}

export type OrdinalscomPackage = typeof ordinalscomPackage
