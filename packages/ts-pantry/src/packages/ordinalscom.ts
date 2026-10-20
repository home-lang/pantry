/**
 * **ord** - Index, block explorer, and command-line wallet
 *
 * @domain `ordinals.com`
 * @programs `ord`
 * @version `0.29.1` (53 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ordinals.com`
 * @homepage https://ordinals.com/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.ordinalscom
 * console.log(pkg.name)        // "ord"
 * console.log(pkg.description) // "Index, block explorer, and command-line wallet"
 * console.log(pkg.programs)    // ["ord"]
 * console.log(pkg.versions[0]) // "0.29.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/ordinals-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install ordinals.com' as const,
  pantryInstallCommand: 'pantry install ordinals.com' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.29.1',
    '0.29.0',
    '0.28.0',
    '0.27.1',
    '0.27.0',
    '0.26.0',
    '0.25.0',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.3',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.2',
    '0.22.1',
    '0.22.0',
    '0.21.3',
    '0.21.2',
    '0.21.1',
    '0.21.0',
    '0.20.1',
    '0.20.0',
    '0.19.1',
    '0.19.0',
    '0.18.5',
    '0.18.4',
    '0.18.3',
    '0.18.2',
    '0.18.1',
    '0.18.0',
    '0.17.1',
    '0.17.0',
    '0.16.0',
    '0.15.0',
    '0.14.1',
    '0.14.0',
    '0.13.1',
    '0.13.0',
    '0.12.3',
    '0.12.2',
    '0.12.1',
    '0.12.0',
    '0.11.1',
    '0.11.0',
    '0.10.0',
    '0.9.0',
    '0.8.3',
    '0.8.2',
    '0.6.1',
    '0.6.0',
    '0.5.1',
    '0.5.0',
  ] as const,
  aliases: [] as const,
}

export type OrdinalscomPackage = typeof ordinalscomPackage
